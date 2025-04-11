"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Prescription } from './prescriptionService';
import { Patient } from './patientService';
import { AppSettings } from './settingsService';
import { Appointment } from './appointmentService';
import { Invoice } from './invoiceService';

// Add autotable to jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generatePrescriptionPDF(prescription: Prescription, settings: AppSettings): void {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add clinic logo or name at the top
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clinic.name, 105, 20, { align: 'center' });
  
  // Add clinic details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const clinicAddress = `${settings.clinic.address}, ${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`;
  doc.text(clinicAddress, 105, 28, { align: 'center' });
  
  const clinicContacts = `Phone: ${settings.clinic.phone} | Email: ${settings.clinic.email}`;
  doc.text(clinicContacts, 105, 34, { align: 'center' });
  
  if (settings.clinic.website) {
    doc.text(`Website: ${settings.clinic.website}`, 105, 40, { align: 'center' });
  }
  
  // Add doctor information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prescribed by: ${settings.staff.primaryDoctor} ${settings.staff.primaryDoctorCredentials}`, 20, 50);
  doc.text(`License: ${settings.staff.licenseNumber}`, 20, 56);
  
  // Add prescription title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION', 105, 70, { align: 'center' });
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 75, 190, 75);
  
  // Add patient information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 20, 85);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${prescription.patientName}`, 20, 93);
  doc.text(`Date: ${prescription.startDate}`, 20, 99);
  
  // Add prescription details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Medication Details', 20, 110);
  
  // Create prescription table
  autoTable(doc, {
    startY: 115,
    head: [['Medication', 'Dosage', 'Frequency', 'Duration']],
    body: [
      [
        prescription.medication,
        prescription.dosage,
        prescription.frequency,
        prescription.duration
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 },
  });
  
  // Get the last Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  
  // Add instructions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Instructions:', 20, finalY + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Split long instruction text into multiple lines
  const splitInstructions = doc.splitTextToSize(prescription.instructions, 155);
  doc.text(splitInstructions, 20, finalY + 18);
  
  // Add notes if available
  if (prescription.notes) {
    const instructionsHeight = finalY + 20 + (splitInstructions.length * 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 130, instructionsHeight);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(prescription.notes, 60);
    doc.text(splitNotes, 130, instructionsHeight + 8);
  }
  
  // Add signature at the bottom
  doc.setFontSize(10);
  doc.text('Signature:', 130, 250);
  doc.line(150, 250, 190, 250);
  
  // Add prescription ID as a small reference
  doc.setFontSize(8);
  doc.text(`Prescription ID: ${prescription.id}`, 20, 280);
  doc.text(`Status: ${prescription.status.toUpperCase()}`, 150, 280);
  
  // Save PDF with patient name and date
  const fileName = `prescription_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.startDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

export function generatePrescriptionPDFBuffer(prescription: Prescription, settings: AppSettings): any {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add clinic logo or name at the top
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clinic.name, 105, 20, { align: 'center' });
  
  // Add clinic details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const clinicAddress = `${settings.clinic.address}, ${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`;
  doc.text(clinicAddress, 105, 28, { align: 'center' });
  
  const clinicContacts = `Phone: ${settings.clinic.phone} | Email: ${settings.clinic.email}`;
  doc.text(clinicContacts, 105, 34, { align: 'center' });
  
  if (settings.clinic.website) {
    doc.text(`Website: ${settings.clinic.website}`, 105, 40, { align: 'center' });
  }
  
  // Add doctor information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prescribed by: ${settings.staff.primaryDoctor} ${settings.staff.primaryDoctorCredentials}`, 20, 50);
  doc.text(`License: ${settings.staff.licenseNumber}`, 20, 56);
  
  // Add prescription title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION', 105, 70, { align: 'center' });
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 75, 190, 75);
  
  // Add patient information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 20, 85);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${prescription.patientName}`, 20, 93);
  doc.text(`Date: ${prescription.startDate}`, 20, 99);
  
  // Add prescription details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Medication Details', 20, 110);
  
  // Create prescription table
  autoTable(doc, {
    startY: 115,
    head: [['Medication', 'Dosage', 'Frequency', 'Duration']],
    body: [
      [
        prescription.medication,
        prescription.dosage,
        prescription.frequency,
        prescription.duration
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 },
  });
  
  // Get the last Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  
  // Add instructions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Instructions:', 20, finalY + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Split long instruction text into multiple lines
  const splitInstructions = doc.splitTextToSize(prescription.instructions, 155);
  doc.text(splitInstructions, 20, finalY + 18);
  
  // Add notes if available
  if (prescription.notes) {
    const instructionsHeight = finalY + 20 + (splitInstructions.length * 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 130, instructionsHeight);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(prescription.notes, 60);
    doc.text(splitNotes, 130, instructionsHeight + 8);
  }
  
  // Add signature at the bottom
  doc.setFontSize(10);
  doc.text('Signature:', 130, 250);
  doc.line(150, 250, 190, 250);
  
  // Add prescription ID as a small reference
  doc.setFontSize(8);
  doc.text(`Prescription ID: ${prescription.id}`, 20, 280);
  doc.text(`Status: ${prescription.status.toUpperCase()}`, 150, 280);
  
  // Return PDF buffer
  return doc.output('arraybuffer');
}

export function generatePatientPDF(patient: Patient, settings: AppSettings): void {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add clinic logo or name at the top
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clinic.name, 105, 20, { align: 'center' });
  
  // Add clinic details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const clinicAddress = `${settings.clinic.address}, ${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`;
  doc.text(clinicAddress, 105, 28, { align: 'center' });
  
  const clinicContacts = `Phone: ${settings.clinic.phone} | Email: ${settings.clinic.email}`;
  doc.text(clinicContacts, 105, 34, { align: 'center' });
  
  if (settings.clinic.website) {
    doc.text(`Website: ${settings.clinic.website}`, 105, 40, { align: 'center' });
  }
  
  // Add doctor information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Doctor: ${settings.staff.primaryDoctor} ${settings.staff.primaryDoctorCredentials}`, 20, 50);
  doc.text(`License: ${settings.staff.licenseNumber}`, 20, 56);
  
  // Add report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT REPORT', 105, 70, { align: 'center' });
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 75, 190, 75);
  
  // Add patient information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 20, 85);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, 93);
  doc.text(`Date of Birth: ${patient.dateOfBirth}`, 20, 99);
  doc.text(`Gender: ${patient.gender}`, 20, 105);
  doc.text(`Email: ${patient.email}`, 20, 111);
  doc.text(`Phone: ${patient.phone}`, 20, 117);
  
  // Address information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Address', 20, 127);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patient.address}`, 20, 135);
  doc.text(`${patient.city}, ${patient.state} ${patient.zip}`, 20, 141);
  
  // Medical information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Information', 20, 155);
  
  // Create medical information table
  autoTable(doc, {
    startY: 160,
    head: [['Category', 'Details']],
    body: [
      ['Blood Type', patient.bloodType || 'Not specified'],
      ['Height', patient.height || 'Not specified'],
      ['Weight', patient.weight || 'Not specified'],
      ['Allergies', patient.allergies || 'None reported'],
      ['Current Medications', patient.medications || 'None reported'],
      ['Medical Conditions', patient.medicalConditions || 'None reported']
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 },
  });
  
  // Get the last Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  
  // Additional medical history
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical History', 20, finalY + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Family history
  doc.setFont('helvetica', 'bold');
  doc.text('Family History:', 20, finalY + 20);
  doc.setFont('helvetica', 'normal');
  const splitFamilyHistory = doc.splitTextToSize(patient.familyHistory || 'No family history recorded', 155);
  doc.text(splitFamilyHistory, 25, finalY + 28);
  
  // Surgical history
  const familyHistoryHeight = finalY + 30 + (splitFamilyHistory.length * 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Surgical History:', 20, familyHistoryHeight);
  doc.setFont('helvetica', 'normal');
  const splitSurgicalHistory = doc.splitTextToSize(patient.surgicalHistory || 'No surgical history recorded', 155);
  doc.text(splitSurgicalHistory, 25, familyHistoryHeight + 8);
  
  // Notes if available
  if (patient.notes) {
    const surgicalHistoryHeight = familyHistoryHeight + 10 + (splitSurgicalHistory.length * 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 130, surgicalHistoryHeight);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(patient.notes, 60);
    doc.text(splitNotes, 130, surgicalHistoryHeight + 8);
  }
  
  // Add signature at the bottom
  doc.setFontSize(10);
  doc.text('Signature:', 130, 250);
  doc.line(150, 250, 190, 250);
  
  // Add insurance information
  doc.setFontSize(8);
  if (patient.insuranceProvider) {
    doc.text(`Insurance: ${patient.insuranceProvider}`, 20, 270);
    if (patient.insuranceId) {
      doc.text(`Insurance ID: ${patient.insuranceId}`, 20, 275);
    }
  }
  
  // Add patient ID as a small reference
  doc.text(`Patient ID: ${patient.id}`, 20, 280);
  
  // Save PDF with patient name and date
  const today = new Date().toISOString().split('T')[0];
  const fileName = `patient_report_${patient.firstName}_${patient.lastName}_${today}.pdf`;
  doc.save(fileName);
}

export function generateAppointmentPDF(appointment: Appointment, patient: Patient, settings: AppSettings): void {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set up colors for the design
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark slate
  const highlightColor = [46, 204, 113]; // Green
  
  // Add a colored header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Add clinic logo or name in the header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clinic.name, 105, 15, { align: 'center' });
  
  // Add clinic details in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const clinicContacts = `${settings.clinic.phone} | ${settings.clinic.email}`;
  doc.text(clinicContacts, 105, 22, { align: 'center' });
  doc.text(`${settings.clinic.address}, ${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`, 105, 28, { align: 'center' });
  
  // Add appointment title with a colored background
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(10, 40, 190, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT SLIP', 105, 47, { align: 'center' });
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);
  
  // Create appointment number
  const appointmentNumber = appointment.id ? 
    `APT-${appointment.id.substring(0, 8).toUpperCase()}-${new Date().getTime().toString().substring(9, 13)}` : 
    `APT-${new Date().getTime()}`;
  
  // Two column layout for main content
  // Left column (60% width) for patient and appointment details
  // Right column (40% width) for appointment number and important info
  
  // Left column - Patient info
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 55, 115, 60, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 15, 62);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 15, 70);
  doc.text(`Patient ID: ${patient.id ? patient.id.substring(0, 8).toUpperCase() : 'N/A'}`, 15, 77);
  doc.text(`Phone: ${patient.phone}`, 15, 84);
  doc.text(`Email: ${patient.email}`, 15, 91);
  
  // Left column - Appointment details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT DETAILS', 15, 101);
  
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const formattedDate = appointmentDate.toLocaleDateString(undefined, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString(undefined, {
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formattedDate}`, 15, 109);
  doc.text(`Time: ${formattedTime}`, 15, 116);
  doc.text(`Type: ${appointment.type}`, 15, 123);
  doc.text(`Duration: ${appointment.duration} minutes`, 15, 130);
  
  // Right column - Appointment number
  doc.setFillColor(highlightColor[0], highlightColor[1], highlightColor[2]);
  doc.rect(130, 55, 70, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT #', 165, 62, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(appointmentNumber, 165, 72, { align: 'center' });
  
  // Right column - Status
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(245, 245, 245);
  doc.rect(130, 85, 70, 30, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS', 165, 93, { align: 'center' });
  
  // Status with colored background based on status type
  let statusColor = [255, 193, 7]; // Yellow (scheduled)
  if (appointment.status === 'confirmed') {
    statusColor = [46, 204, 113]; // Green
  } else if (appointment.status === 'cancelled') {
    statusColor = [231, 76, 60]; // Red
  } else if (appointment.status === 'completed') {
    statusColor = [52, 152, 219]; // Blue
  }
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(140, 98, 50, 12, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(appointment.status.toUpperCase(), 165, 106, { align: 'center' });
  
  // Notes section if available
  if (appointment.notes && appointment.notes.trim() !== '') {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 120, 190, 30, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', 15, 128);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(appointment.notes, 180);
    doc.text(splitNotes, 15, 136);
  }
  
  // Important information section with colored background
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.1); // Light blue
  doc.rect(10, 155, 190, 35, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT INFORMATION', 105, 163, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Please arrive 15 minutes before your scheduled appointment time.', 15, 171);
  doc.text('2. Bring your ID and insurance information.', 15, 178);
  doc.text('3. Contact us 24 hours in advance to reschedule or cancel.', 15, 185);
  
  // Bottom bar
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 280, 210, 17, 'F');
  
  // Footer text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Appointment ID: ${appointment.id || 'N/A'}`, 15, 287);
  doc.text('This is a computer-generated document and does not require a signature', 105, 287, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 287, { align: 'right' });
  
  // Save PDF with patient name and date
  const today = new Date().toISOString().split('T')[0];
  const fileName = `appointment_slip_${patient.firstName}_${patient.lastName}_${today}.pdf`;
  doc.save(fileName);
}

// Helper function to get currency format that works well in PDFs
function getFormattedCurrency(value: number, currencyCode: string): string {
  // For currencies with potentially problematic symbols in PDFs, use the currency code
  const problematicCurrencies = ['INR', 'THB', 'RUB', 'UAH', 'KZT', 'BDT', 'NPR', 'LKR', 'PKR', 'GHS', 'NGN'];
  
  if (problematicCurrencies.includes(currencyCode)) {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
  
  // Use standard currency symbols for common currencies
  const currencySymbols: { [key: string]: string } = {
    'USD': '$', 
    'EUR': '€', 
    'GBP': '£', 
    'JPY': '¥', 
    'CAD': 'CA$', 
    'AUD': 'A$', 
    'CNY': '¥',
    'BRL': 'R$',
    'MXN': 'MX$',
    'ZAR': 'R',
    'SGD': 'S$',
    'NZD': 'NZ$',
    'CHF': 'CHF',
    'HKD': 'HK$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł'
  };
  
  const symbol = currencySymbols[currencyCode] || currencyCode;
  return `${symbol} ${value.toFixed(2)}`;
}

export function generateInvoicePDF(invoice: Invoice, patient: Patient, settings: AppSettings): void {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Store currency code for formatting
  const currencyCode = settings.financial.currency;
  
  // Add clinic logo or name at the top
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clinic.name, 105, 20, { align: 'center' });
  
  // Add clinic details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const clinicAddress = `${settings.clinic.address}, ${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`;
  doc.text(clinicAddress, 105, 28, { align: 'center' });
  
  const clinicContacts = `Phone: ${settings.clinic.phone} | Email: ${settings.clinic.email}`;
  doc.text(clinicContacts, 105, 34, { align: 'center' });
  
  if (settings.clinic.website) {
    doc.text(`Website: ${settings.clinic.website}`, 105, 40, { align: 'center' });
  }
  
  // Add invoice title and number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 60, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 70);
  doc.text(`Date: ${invoice.date}`, 150, 70);
  doc.text(`Due Date: ${invoice.dueDate}`, 150, 78);
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 85, 190, 85);
  
  // Add biller and client information side by side
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed From:', 20, 95);
  doc.text('Billed To:', 120, 95);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.clinic.name, 20, 103);
  doc.text(`${settings.staff.primaryDoctor} ${settings.staff.primaryDoctorCredentials}`, 20, 111);
  doc.text(settings.clinic.address, 20, 119);
  doc.text(`${settings.clinic.city}, ${settings.clinic.state} ${settings.clinic.zip}`, 20, 127);
  doc.text(`Phone: ${settings.clinic.phone}`, 20, 135);
  
  // Client information
  doc.text(invoice.patientName, 120, 103);
  if (patient) {
    doc.text(patient.address || '', 120, 111);
    doc.text(`${patient.city || ''}, ${patient.state || ''} ${patient.zipCode || ''}`, 120, 119);
    doc.text(`Phone: ${patient.phone || ''}`, 120, 127);
    doc.text(`Email: ${patient.email || ''}`, 120, 135);
  }
  
  // Add invoice items table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Items', 20, 150);
  
  // Create table for invoice items
  const tableRows = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    getFormattedCurrency(item.unitPrice, currencyCode),
    getFormattedCurrency(item.amount, currencyCode)
  ]);
  
  autoTable(doc, {
    startY: 155,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 20, right: 20 },
  });
  
  // Get the last Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 180;
  
  // Add totals
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, finalY + 15);
  doc.text(getFormattedCurrency(invoice.subtotal, currencyCode), 175, finalY + 15, { align: 'right' });
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 140, finalY + 23);
    doc.text(getFormattedCurrency(invoice.discount, currencyCode), 175, finalY + 23, { align: 'right' });
  }
  
  if (invoice.tax > 0) {
    const taxAmount = invoice.subtotal * (invoice.tax / 100);
    doc.text(`Tax (${invoice.tax}%):`, 140, finalY + 31);
    doc.text(getFormattedCurrency(taxAmount, currencyCode), 175, finalY + 31, { align: 'right' });
  }
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 42);
  doc.text(getFormattedCurrency(invoice.total, currencyCode), 175, finalY + 42, { align: 'right' });
  
  // Add payment status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 20, finalY + 23);
  
  if (invoice.paymentMethod) {
    doc.text(`Payment Method: ${invoice.paymentMethod}`, 20, finalY + 31);
  }
  
  if (invoice.paymentDate) {
    doc.text(`Payment Date: ${invoice.paymentDate}`, 20, finalY + 39);
  }
  
  // Add notes if available
  if (invoice.notes) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, finalY + 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, finalY + 63);
  }
  
  // Add payment instructions
  const paymentY = invoice.notes ? finalY + 63 + (doc.splitTextToSize(invoice.notes, 170).length * 5) + 10 : finalY + 60;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions:', 20, paymentY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Please make payment by the due date.', 20, paymentY + 8);
  
  if (settings.clinic.paymentDetails) {
    const splitPaymentDetails = doc.splitTextToSize(settings.clinic.paymentDetails, 170);
    doc.text(splitPaymentDetails, 20, paymentY + 16);
  }
  
  if (settings.financial.bankName && settings.financial.accountNumber) {
    doc.text(`Bank: ${settings.financial.bankName}`, 20, paymentY + 32);
    doc.text(`Account Name: ${settings.financial.accountName}`, 20, paymentY + 40);
    doc.text(`Account Number: ${settings.financial.accountNumber}`, 20, paymentY + 48);
  }
  
  // Add payment terms from settings
  if (settings.financial.paymentTerms) {
    doc.text(`Payment Terms: Net ${settings.financial.paymentTerms} days`, 20, paymentY + 56);
  }
  
  // Add footer with accepted payment methods if available
  if (settings.financial.acceptedPaymentMethods && settings.financial.acceptedPaymentMethods.length > 0) {
    const methods = settings.financial.acceptedPaymentMethods.map(
      m => m.charAt(0).toUpperCase() + m.slice(1)
    ).join(', ');
    doc.text(`Accepted Payment Methods: ${methods}`, 20, paymentY + 64);
  }
  
  // Add invoice ID as a small reference
  doc.setFontSize(8);
  doc.text(`Invoice ID: ${invoice.id}`, 20, 280);
  
  // Save PDF with invoice number and date
  const fileName = `invoice_${invoice.invoiceNumber}_${invoice.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
} 