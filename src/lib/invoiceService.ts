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

// Invoice Item type
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Invoice types
export interface Invoice {
  id?: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
}

// Get all invoices for the current user
export async function getInvoices(user: User): Promise<Invoice[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch invoices');
  }

  try {
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('createdBy', '==', user.uid),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(invoicesQuery);
    const invoices: Invoice[] = [];
    
    snapshot.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data()
      } as Invoice);
    });
    
    return invoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Get a single invoice by ID
export async function getInvoice(user: User, invoiceId: string): Promise<Invoice | null> {
  if (!user) {
    throw new Error('User must be authenticated to fetch invoice');
  }

  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (invoiceSnap.exists()) {
      const invoiceData = invoiceSnap.data();
      
      // Verify this invoice belongs to the current user
      if (invoiceData.createdBy !== user.uid) {
        throw new Error('Unauthorized access to invoice data');
      }
      
      return {
        id: invoiceSnap.id,
        ...invoiceData
      } as Invoice;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

// Add a new invoice
export async function addInvoice(user: User, invoiceData: Omit<Invoice, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  if (!user) {
    throw new Error('User must be authenticated to add invoice');
  }

  try {
    const invoiceWithMeta = {
      ...invoiceData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'invoices'), invoiceWithMeta);
    
    // Return the complete invoice object with ID
    return {
      id: docRef.id,
      ...invoiceData,
      createdBy: user.uid,
    } as Invoice;
  } catch (error) {
    console.error('Error adding invoice:', error);
    throw error;
  }
}

// Update an invoice
export async function updateInvoice(user: User, invoiceId: string, invoiceData: Partial<Invoice>): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to update invoice');
  }

  try {
    // Fetch the invoice first to verify ownership
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (!invoiceSnap.exists()) {
      throw new Error('Invoice not found');
    }
    
    const existingData = invoiceSnap.data();
    if (existingData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to invoice data');
    }
    
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

// Delete an invoice
export async function deleteInvoice(user: User, invoiceId: string): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to delete invoice');
  }

  try {
    // Fetch the invoice first to verify ownership
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (!invoiceSnap.exists()) {
      throw new Error('Invoice not found');
    }
    
    const invoiceData = invoiceSnap.data();
    if (invoiceData.createdBy !== user.uid) {
      throw new Error('Unauthorized access to invoice data');
    }
    
    await deleteDoc(invoiceRef);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Search invoices
export async function searchInvoices(user: User, searchTerm: string): Promise<Invoice[]> {
  // First get all invoices
  const invoices = await getInvoices(user);
  
  // Filter by search term
  if (!searchTerm) return invoices;
  
  const lowerSearch = searchTerm.toLowerCase();
  
  return invoices.filter(invoice => 
    invoice.patientName.toLowerCase().includes(lowerSearch) ||
    invoice.invoiceNumber.toLowerCase().includes(lowerSearch) ||
    invoice.paymentStatus.toLowerCase().includes(lowerSearch)
  );
}

// Get invoices for a specific patient
export async function getPatientInvoices(user: User, patientId: string): Promise<Invoice[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch invoices');
  }

  try {
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('createdBy', '==', user.uid),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(invoicesQuery);
    const invoices: Invoice[] = [];
    
    snapshot.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data()
      } as Invoice);
    });
    
    return invoices;
  } catch (error) {
    console.error('Error fetching patient invoices:', error);
    throw error;
  }
}

// Generate a new invoice number
export async function generateInvoiceNumber(user: User): Promise<string> {
  if (!user) {
    throw new Error('User must be authenticated to generate invoice number');
  }

  try {
    // Get count of existing invoices to use as base for invoice number
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('createdBy', '==', user.uid)
    );
    
    const snapshot = await getDocs(invoicesQuery);
    const count = snapshot.size;
    
    // Create invoice number with format: INV-{YYYYMMDD}-{count+1}
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `INV-${year}${month}${day}-${count + 1}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
}

// Get unpaid invoices
export async function getUnpaidInvoices(user: User): Promise<Invoice[]> {
  if (!user) {
    throw new Error('User must be authenticated to fetch unpaid invoices');
  }

  try {
    // Get all invoices
    const invoices = await getInvoices(user);
    
    // Filter for unpaid invoices (pending or overdue)
    return invoices.filter(invoice => 
      invoice.paymentStatus === 'pending' || 
      invoice.paymentStatus === 'overdue' || 
      invoice.paymentStatus === 'partial'
    );
  } catch (error) {
    console.error('Error fetching unpaid invoices:', error);
    throw error;
  }
} 