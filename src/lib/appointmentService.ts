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

// Appointment types
export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | string;
  type: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
}

// Get all appointments for current user
export async function getAppointments(user: User): Promise<Appointment[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch appointments');
  }

  try {
    const appointmentsQuery = query(
      collection(db, 'appointments'), 
      where('createdBy', '==', user.uid),
      orderBy('date', 'desc'),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      } as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

// Get a single appointment by ID
export async function getAppointment(user: User, appointmentId: string): Promise<Appointment | null> {
  if (!user) {
    throw new Error('User must be authenticated to fetch appointment');
  }

  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (appointmentSnap.exists()) {
      const appointmentData = appointmentSnap.data();
      
      // Verify this appointment belongs to the current user
      if (appointmentData.createdBy !== user.uid) {
        throw new Error('Unauthorized access to appointment data');
      }
      
      return {
        id: appointmentSnap.id,
        ...appointmentData
      } as Appointment;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
}

// Add a new appointment
export async function addAppointment(user: User, appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  if (!user) {
    throw new Error('User must be authenticated to add an appointment');
  }

  try {
    const newAppointment = {
      ...appointmentData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'appointments'), newAppointment);
    
    return {
      id: docRef.id,
      ...newAppointment
    } as Appointment;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
}

// Update an existing appointment
export async function updateAppointment(user: User, appointmentId: string, appointmentData: Partial<Appointment>): Promise<boolean> {
  if (!user) {
    throw new Error('User must be authenticated to update an appointment');
  }

  try {
    // First verify this appointment belongs to the user
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }
    
    const appointmentDoc = appointmentSnap.data();
    
    if (appointmentDoc.createdBy !== user.uid) {
      throw new Error('Unauthorized access to appointment data');
    }
    
    // Update the appointment
    const updateData = {
      ...appointmentData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(appointmentRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

// Delete an appointment
export async function deleteAppointment(user: User, appointmentId: string): Promise<boolean> {
  if (!user) {
    throw new Error('User must be authenticated to delete an appointment');
  }

  try {
    // First verify this appointment belongs to the user
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }
    
    const appointmentDoc = appointmentSnap.data();
    
    if (appointmentDoc.createdBy !== user.uid) {
      throw new Error('Unauthorized access to appointment data');
    }
    
    // Delete the appointment
    await deleteDoc(appointmentRef);
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

// Get appointments for a specific patient
export async function getPatientAppointments(user: User, patientId: string): Promise<Appointment[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch patient appointments');
  }

  try {
    const appointmentsQuery = query(
      collection(db, 'appointments'), 
      where('createdBy', '==', user.uid),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      } as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    throw error;
  }
}

// Get upcoming appointments
export async function getUpcomingAppointments(user: User, limit: number = 5): Promise<Appointment[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch upcoming appointments');
  }

  try {
    // Get all appointments (Firebase doesn't support complex queries well)
    const appointments = await getAppointments(user);
    
    // Filter for future appointments
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const upcoming = appointments
      .filter(appt => {
        // Check if date is today or future
        if (appt.date > todayStr) return true;
        if (appt.date === todayStr) {
          // For today, check if time is in the future
          const [hours, minutes] = appt.time.split(':');
          const apptTime = new Date();
          apptTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return apptTime > now;
        }
        return false;
      })
      .filter(appt => appt.status !== 'cancelled')
      .sort((a, b) => {
        // Sort by date and time
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
      .slice(0, limit);
    
    return upcoming;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
} 