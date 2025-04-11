"use client";

import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Define types for settings
export interface ClinicSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website: string;
  paymentDetails?: string;
}

export interface FinancialSettings {
  currency: string;
  taxRate: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  paymentTerms: string;
  enableOnlinePayments: boolean;
  acceptedPaymentMethods: string[];
}

export interface StaffSettings {
  primaryDoctor: string;
  primaryDoctorCredentials: string;
  practiceType: string;
  licenseNumber: string;
  taxId: string;
}

export interface PreferenceSettings {
  appointmentReminders: boolean;
  autoConfirmAppointments: boolean;
  defaultAppointmentDuration: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  dateFormat: string;
  timeFormat: string;
}

export interface AppSettings {
  clinic: ClinicSettings;
  financial: FinancialSettings;
  staff: StaffSettings;
  preferences: PreferenceSettings;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Default settings
export const defaultSettings: AppSettings = {
  clinic: {
    name: "DentFlow Clinic",
    email: "contact@dentflowclinic.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Center Blvd, Suite 200",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "US",
    website: "https://dentflowclinic.com",
  },
  financial: {
    currency: "USD",
    taxRate: "8.5",
    bankName: "First National Bank",
    accountName: "DentFlow Clinic LLC",
    accountNumber: "XXXX-XXXX-1234",
    routingNumber: "XXXXX0123",
    paymentTerms: "30",
    enableOnlinePayments: true,
    acceptedPaymentMethods: ["credit", "debit", "cash", "insurance"],
  },
  staff: {
    primaryDoctor: "Dr. Sarah Johnson",
    primaryDoctorCredentials: "DDS, MS",
    practiceType: "General Dentistry",
    licenseNumber: "DEN12345",
    taxId: "XX-XXXXXXX",
  },
  preferences: {
    appointmentReminders: true,
    autoConfirmAppointments: false,
    defaultAppointmentDuration: "60",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  },
  userId: "",
};

// Get user settings from Firestore
export async function getUserSettings(user: User): Promise<AppSettings> {
  if (!user) {
    throw new Error('User must be authenticated to fetch settings');
  }

  try {
    const settingsRef = doc(db, 'settings', user.uid);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as AppSettings;
    } else {
      // Create default settings for new users
      const newSettings = {
        ...defaultSettings,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(settingsRef, newSettings);
      return newSettings;
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
}

// Save all settings at once
export async function saveSettings(user: User, settings: AppSettings): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to save settings');
  }

  try {
    const settingsRef = doc(db, 'settings', user.uid);
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Update specific setting category
export async function updateSettingsCategory<T>(
  user: User, 
  category: 'clinic' | 'financial' | 'staff' | 'preferences', 
  data: T
): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to update settings');
  }

  try {
    const settingsRef = doc(db, 'settings', user.uid);
    await updateDoc(settingsRef, {
      [category]: data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating ${category} settings:`, error);
    throw error;
  }
} 