"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Trash2, CalendarDays, Pencil, Users, FileDown } from "lucide-react";
import { 
  Appointment, 
  getAppointment, 
  updateAppointment, 
  deleteAppointment 
} from "@/lib/appointmentService";
import { Patient, getPatient, getPatients } from "@/lib/patientService";
import { getUserSettings } from "@/lib/settingsService";
import { generateAppointmentPDF } from "@/lib/pdfUtils";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function AppointmentDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id as string;
  
  // State
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  
  // Load appointment data
  useEffect(() => {
    async function loadAppointmentData() {
      if (user && appointmentId) {
        try {
          // Get appointment details
          const appointmentData = await getAppointment(user, appointmentId);
          
          if (!appointmentData) {
            toast({
              title: "Error",
              description: "Appointment not found",
              variant: "destructive",
            });
            router.push('/appointments');
            return;
          }
          
          setAppointment(appointmentData);
          setFormData(appointmentData);
          
          // Get the patient details
          if (appointmentData.patientId) {
            const patientData = await getPatient(user, appointmentData.patientId);
            setPatient(patientData);
          }
          
          // Also load all patients for the patient dropdown when editing
          const allPatients = await getPatients(user);
          setPatients(allPatients);
          
          // Load clinic settings for PDF generation
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
          
        } catch (error) {
          console.error("Error loading appointment data:", error);
          toast({
            title: "Error",
            description: "Failed to load appointment data",
            variant: "destructive",
          });
          router.push('/appointments');
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading && user) {
      loadAppointmentData();
    }
  }, [user, authLoading, appointmentId, router]);
  
  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle patient change
  const handlePatientChange = (patientId: string) => {
    const selectedPatient = patients.find(p => p.id === patientId);
    
    if (selectedPatient) {
      setFormData({
        ...formData,
        patientId: patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`
      });
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!user || !appointment || !appointment.id) return;
    
    setIsSaving(true);
    
    try {
      await updateAppointment(user, appointment.id, formData);
      
      // Update local state
      setAppointment({
        ...appointment,
        ...formData
      });
      
      // If patient changed, update patient info
      if (formData.patientId && formData.patientId !== appointment.patientId) {
        const newPatient = await getPatient(user, formData.patientId);
        setPatient(newPatient);
      }
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Appointment has been updated",
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!user || !appointment || !appointment.id) return;
    
    try {
      await deleteAppointment(user, appointment.id);
      
      toast({
        title: "Success",
        description: "Appointment has been deleted",
      });
      
      router.push('/appointments');
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle download appointment slip as PDF
  const handleDownloadPDF = () => {
    if (!appointment || !patient || !clinicSettings || !user) {
      toast({
        title: "Error",
        description: "Cannot generate PDF. Missing required data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      generateAppointmentPDF(appointment, patient, clinicSettings);
      
      toast({
        title: "Success",
        description: "Appointment slip has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate appointment slip PDF",
        variant: "destructive",
      });
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => router.push('/appointments')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <h1 className="text-3xl font-bold tracking-tight ml-2">
          {isLoading ? "Loading Appointment..." : "Appointment Details"}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : appointment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointment Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {formData.type || appointment.type}
                  </CardTitle>
                  <CardDescription>
                    {new Date(`${formData.date || appointment.date}T${formData.time || appointment.time}`).toLocaleString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
                
                <div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                    ${(formData.status || appointment.status) === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    (formData.status || appointment.status) === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    (formData.status || appointment.status) === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`
                  }>
                    {((formData.status || appointment.status) as string).charAt(0).toUpperCase() + 
                      ((formData.status || appointment.status) as string).slice(1)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient">Patient</Label>
                      <Select
                        value={formData.patientId || appointment.patientId}
                        onValueChange={handlePatientChange}
                      >
                        <SelectTrigger id="patient">
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id || ''}>
                              {p.firstName} {p.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status || appointment.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || appointment.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time || appointment.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={formData.duration || appointment.duration}
                        onValueChange={(value) => handleChange('duration', value)}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Appointment Type</Label>
                      <Select
                        value={formData.type || appointment.type}
                        onValueChange={(value) => handleChange('type', value)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular Checkup">Regular Checkup</SelectItem>
                          <SelectItem value="Cleaning">Cleaning</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Consultation">Consultation</SelectItem>
                          <SelectItem value="Procedure">Procedure</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this appointment"
                      rows={4}
                      value={formData.notes || appointment.notes || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('notes', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4">
                    <div className="flex items-center space-x-4">
                      <CalendarDays className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">Appointment Details</h3>
                        <p className="text-sm text-muted-foreground">
                          View details and manage this appointment
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Print Slip</span>
                    </Button>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Patient</p>
                        <p className="text-base">
                          {appointment.patientName}
                          {patient && (
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-primary" 
                              onClick={() => patient.id && router.push(`/patients/${patient.id}`)}
                            >
                              (View)
                            </Button>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-base">{appointment.duration} minutes</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                      <p className="text-base">{appointment.notes || "No notes provided."}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setFormData(appointment);
                  }}>
                    Cancel
                  </Button>
                  <Button disabled={isSaving} onClick={handleSave}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Appointment
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
          
          {/* Patient Card (if available) */}
          {patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">{patient.firstName} {patient.lastName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <p className="text-base">{patient.phone}</p>
                    <p className="text-base">{patient.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-base">{patient.dateOfBirth}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => patient.id && router.push(`/patients/${patient.id}`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Patient Details
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Appointment Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The appointment you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.push('/appointments')}>
                Return to Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this appointment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 