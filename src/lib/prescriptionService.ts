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

// Prescription types
export interface Prescription {
  id?: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  status: 'active' | 'completed' | 'cancelled';
  prescribedBy: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
}

// Get all prescriptions for the current user
export async function getPrescriptions(user: User): Promise<Prescription[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch prescriptions');
  }

  try {
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(prescriptionsQuery);
    const prescriptions: Prescription[] = [];
    
    snapshot.forEach((doc) => {
      prescriptions.push({
        id: doc.id,
        ...doc.data()
      } as Prescription);
    });
    
    return prescriptions;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw error;
  }
}

// Get a single prescription by ID
export async function getPrescription(user: User, prescriptionId: string): Promise<Prescription | null> {
  if (!user) {
    throw new Error('User must be authenticated to fetch prescription');
  }

  try {
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    const prescriptionSnap = await getDoc(prescriptionRef);
    
    if (prescriptionSnap.exists()) {
      const prescriptionData = prescriptionSnap.data();
      
      // Verify this prescription belongs to the current user
      if (prescriptionData.createdBy !== user.uid) {
        throw new Error('Unauthorized access to prescription data');
      }
      
      return {
        id: prescriptionSnap.id,
        ...prescriptionData
      } as Prescription;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching prescription:', error);
    throw error;
  }
}

// Add a new prescription
export async function addPrescription(user: User, prescriptionData: Omit<Prescription, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
  if (!user) {
    throw new Error('User must be authenticated to add prescription');
  }

  try {
    const prescriptionWithMeta = {
      ...prescriptionData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionWithMeta);
    
    // Return the complete prescription object with ID
    return {
      id: docRef.id,
      ...prescriptionData,
      createdBy: user.uid,
    } as Prescription;
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
}

// Update a prescription
export async function updatePrescription(user: User, prescriptionId: string, prescriptionData: Partial<Prescription>): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to update prescription');
  }

  try {
    // Fetch the prescription first to verify ownership
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    const prescriptionSnap = await getDoc(prescriptionRef);
    
    if (!prescriptionSnap.exists()) {
      throw new Error('Prescription not found');
    }
    
    const existingData = prescriptionSnap.data();
    if (existingData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to prescription data');
    }
    
    await updateDoc(prescriptionRef, {
      ...prescriptionData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    throw error;
  }
}

// Delete a prescription
export async function deletePrescription(user: User, prescriptionId: string): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to delete prescription');
  }

  try {
    // Fetch the prescription first to verify ownership
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    const prescriptionSnap = await getDoc(prescriptionRef);
    
    if (!prescriptionSnap.exists()) {
      throw new Error('Prescription not found');
    }
    
    const prescriptionData = prescriptionSnap.data();
    if (prescriptionData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to prescription data');
    }
    
    await deleteDoc(prescriptionRef);
  } catch (error) {
    console.error('Error deleting prescription:', error);
    throw error;
  }
}

// Search prescriptions
export async function searchPrescriptions(user: User, searchTerm: string): Promise<Prescription[]> {
  // First get all prescriptions
  const prescriptions = await getPrescriptions(user);
  
  // Filter by search term
  if (!searchTerm) return prescriptions;
  
  const lowerSearch = searchTerm.toLowerCase();
  
  return prescriptions.filter(prescription => 
    prescription.patientName.toLowerCase().includes(lowerSearch) ||
    prescription.medication.toLowerCase().includes(lowerSearch) ||
    prescription.status.toLowerCase().includes(lowerSearch)
  );
}

// Get prescriptions for a specific patient
export async function getPatientPrescriptions(user: User, patientId: string): Promise<Prescription[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch prescriptions');
  }

  try {
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('createdBy', '==', user.uid),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(prescriptionsQuery);
    const prescriptions: Prescription[] = [];
    
    snapshot.forEach((doc) => {
      prescriptions.push({
        id: doc.id,
        ...doc.data()
      } as Prescription);
    });
    
    return prescriptions;
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    throw error;
  }
} 