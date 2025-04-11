"use client";

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp, 
  Timestamp,
  DocumentReference
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Patient types
export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  notes?: string;
  lastVisit?: Timestamp | null;
  nextAppointment?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
  // Medical history fields
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  familyHistory?: string;
  surgicalHistory?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | string;
  height?: string;
  weight?: string;
}

// Get all patients for the current user
export async function getPatients(user: User): Promise<Patient[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch patients');
  }

  try {
    const patientsQuery = query(
      collection(db, 'patients'),
      where('createdBy', '==', user.uid),
      orderBy('lastName')
    );
    
    const snapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];
    
    snapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as Patient);
    });
    
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

// Get a single patient by ID
export async function getPatient(user: User, patientId: string): Promise<Patient | null> {
  if (!user) {
    throw new Error('User must be authenticated to fetch patient');
  }

  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (patientSnap.exists()) {
      const patientData = patientSnap.data();
      
      // Verify this patient belongs to the current user
      if (patientData.createdBy !== user.uid) {
        throw new Error('Unauthorized access to patient data');
      }
      
      return {
        id: patientSnap.id,
        ...patientData
      } as Patient;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
}

// Add a new patient
export async function addPatient(user: User, patientData: Omit<Patient, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!user) {
    throw new Error('User must be authenticated to add patient');
  }

  try {
    const patientWithMeta = {
      ...patientData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'patients'), patientWithMeta);
    return docRef.id;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
}

// Update a patient
export async function updatePatient(user: User, patientId: string, patientData: Partial<Patient>): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to update patient');
  }

  try {
    // Fetch the patient first to verify ownership
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient not found');
    }
    
    const existingData = patientSnap.data();
    if (existingData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to patient data');
    }
    
    await updateDoc(patientRef, {
      ...patientData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

// Delete a patient
export async function deletePatient(user: User, patientId: string): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to delete patient');
  }

  try {
    // Fetch the patient first to verify ownership
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient not found');
    }
    
    const patientData = patientSnap.data();
    if (patientData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to patient data');
    }
    
    await deleteDoc(patientRef);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
}

// Search patients
export async function searchPatients(user: User, searchTerm: string): Promise<Patient[]> {
  // First get all patients
  const patients = await getPatients(user);
  
  // Filter by search term
  if (!searchTerm) return patients;
  
  const lowerSearch = searchTerm.toLowerCase();
  
  return patients.filter(patient => 
    patient.firstName.toLowerCase().includes(lowerSearch) ||
    patient.lastName.toLowerCase().includes(lowerSearch) ||
    patient.email.toLowerCase().includes(lowerSearch) ||
    patient.phone.includes(searchTerm)
  );
} 