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
import { ArrowLeft, Loader2, Save, Trash2, FileDown } from "lucide-react";
import { 
  Patient, 
  getPatient, 
  updatePatient, 
  deletePatient 
} from "@/lib/patientService";
import { getUserSettings } from "@/lib/settingsService";
import { generatePatientPDF } from "@/lib/pdfUtils";
import { Textarea } from "@/components/ui/textarea";

export default function PatientDetailPage() {
  // Get the patient ID from the route parameters
  const params = useParams();
  const patientId = params?.id as string;
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  
  // Fetch patient data from Firebase
  useEffect(() => {
    async function fetchData() {
      if (user && patientId) {
        setIsLoading(true);
        try {
          // Fetch patient data
          const patientData = await getPatient(user, patientId);
          if (!patientData) {
            toast({
              title: "Error",
              description: "Patient not found.",
              variant: "destructive"
            });
            router.push("/patients");
            return;
          }
          setPatient(patientData);
          
          // Fetch clinic settings for reference
          const settings = await getUserSettings(user);
          setClinicInfo(settings.clinic);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load patient data. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading && user) {
      fetchData();
    }
  }, [patientId, user, authLoading, router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!patient) return;
    
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev!,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (!patient) return;
    
    setPatient(prev => ({
      ...prev!,
      [name]: value
    }));
  };
  
  // Save patient changes
  const handleSave = async () => {
    if (!user || !patient) return;
    
    setIsSaving(true);
    try {
      await updatePatient(user, patientId, patient);
      
      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: "Error",
        description: "Failed to save patient information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete patient
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deletePatient(user, patientId);
      
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      
      router.push("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };
  
  // Handler for downloading patient report as PDF
  const handleDownloadPDF = () => {
    try {
      if (!clinicInfo || !patient || !user) {
        toast({
          title: "Error",
          description: "Cannot generate PDF. Missing required data.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a full settings object from the clinicInfo
      const settings = {
        clinic: clinicInfo,
        staff: {
          primaryDoctor: clinicInfo.primaryDoctor || "Doctor",
          primaryDoctorCredentials: clinicInfo.primaryDoctorCredentials || "",
          licenseNumber: clinicInfo.licenseNumber || "",
          practiceType: clinicInfo.practiceType || "",
          taxId: clinicInfo.taxId || "",
        },
        financial: {
          currency: "USD",
          taxRate: "",
          bankName: "",
          accountName: "",
          accountNumber: "",
          routingNumber: "",
          paymentTerms: "",
          enableOnlinePayments: false,
          acceptedPaymentMethods: [],
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
        userId: user.uid,
      };
      
      generatePatientPDF(patient, settings);
      
      toast({
        title: "Success",
        description: "Patient report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate patient report PDF",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated or patient not found
  if (!user || !patient) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/patients")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">
            {patient.firstName} {patient.lastName}
          </h1>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage patient information
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Patient Details</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="billing">Billing & Insurance</TabsTrigger>
        </TabsList>
        
        {/* Patient Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic contact and demographic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={patient.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={patient.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={patient.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={patient.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={patient.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={patient.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={patient.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={patient.city}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={patient.state}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={patient.zip}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={patient.notes || ""}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                    Delete Patient
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete {patient.firstName} {patient.lastName}'s patient record and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Medical History Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>
                Patient's medical history and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="List any known allergies"
                    rows={3}
                    value={patient.allergies || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    placeholder="List current medications and dosages"
                    rows={3}
                    value={patient.medications || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    placeholder="List any diagnosed medical conditions"
                    rows={3}
                    value={patient.medicalConditions || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Family Medical History</Label>
                  <Textarea
                    id="familyHistory"
                    name="familyHistory"
                    placeholder="Relevant family medical history"
                    rows={3}
                    value={patient.familyHistory || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surgicalHistory">Surgical History</Label>
                <Textarea
                  id="surgicalHistory"
                  name="surgicalHistory"
                  placeholder="Previous surgeries and dates"
                  rows={3}
                  value={patient.surgicalHistory || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select 
                    value={patient.bloodType || "Unknown"}
                    onValueChange={(value) => handleSelectChange('bloodType', value)}
                  >
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    name="height"
                    placeholder="e.g., 175 cm or 5'9&quot;"
                    value={patient.height || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    name="weight"
                    placeholder="e.g., 70 kg or 154 lbs"
                    value={patient.weight || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Billing & Insurance Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>
                Patient's insurance and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    name="insuranceProvider"
                    value={patient.insuranceProvider || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="insuranceId">Insurance ID</Label>
                  <Input
                    id="insuranceId"
                    name="insuranceId"
                    value={patient.insuranceId || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {clinicInfo && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Clinic Information</h3>
                    <p className="text-sm text-muted-foreground">
                      This information will be used on patient bills and invoices
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground text-sm">Clinic Name</Label>
                      <p>{clinicInfo.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Contact Email</Label>
                      <p>{clinicInfo.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-sm">Clinic Address</Label>
                    <p>
                      {clinicInfo.address}, {clinicInfo.city}, {clinicInfo.state} {clinicInfo.zip}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 