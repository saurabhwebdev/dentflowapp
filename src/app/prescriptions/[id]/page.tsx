"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { use } from "react";
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
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Save, Trash2, Pill, FileDown, MoreHorizontal } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Prescription, getPrescription, updatePrescription, deletePrescription } from "@/lib/prescriptionService";
import { Patient, getPatients } from "@/lib/patientService";
import { getUserSettings } from "@/lib/settingsService";
import { generatePrescriptionPDF } from "@/lib/pdfUtils";

export default function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const prescriptionId = use(params).id;
  
  // State
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  
  // Load prescription, patients, and clinic settings
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          // Load prescription
          const fetchedPrescription = await getPrescription(user, prescriptionId);
          
          if (!fetchedPrescription) {
            toast({
              title: "Error",
              description: "Prescription not found",
              variant: "destructive",
            });
            router.push('/prescriptions');
            return;
          }
          
          setPrescription(fetchedPrescription);
          
          // Load patients for the form
          const fetchedPatients = await getPatients(user);
          setPatients(fetchedPatients);
          
          // Load clinic settings for PDF generation
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
        } catch (error) {
          console.error("Error loading prescription:", error);
          toast({
            title: "Error",
            description: "Failed to load prescription details",
            variant: "destructive",
          });
          router.push('/prescriptions');
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, prescriptionId, router]);
  
  // Handle form changes
  const handleInputChange = (name: string, value: string) => {
    if (prescription) {
      setPrescription({
        ...prescription,
        [name]: value
      });
    }
  };
  
  // Handle patient change
  const handlePatientChange = (patientId: string) => {
    if (prescription) {
      const selectedPatient = patients.find(p => p.id === patientId);
      if (selectedPatient) {
        setPrescription({
          ...prescription,
          patientId,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`
        });
      }
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: string) => {
    if (prescription) {
      setPrescription({
        ...prescription,
        status: status as 'active' | 'completed' | 'cancelled'
      });
    }
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !prescription) return;
    
    setIsSaving(true);
    
    try {
      await updatePrescription(user, prescriptionId, prescription);
      
      toast({
        title: "Success",
        description: "Prescription has been updated",
      });
    } catch (error) {
      console.error("Error updating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle prescription deletion
  const handleDeletePrescription = async () => {
    if (!user) return;
    
    try {
      await deletePrescription(user, prescriptionId);
      
      toast({
        title: "Success",
        description: "Prescription has been deleted",
      });
      
      router.push('/prescriptions');
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!prescription || !clinicSettings) {
      toast({
        title: "Error",
        description: "Cannot generate PDF. Missing prescription or clinic data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      generatePrescriptionPDF(prescription, clinicSettings);
      toast({
        title: "Success",
        description: "Prescription PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate prescription PDF",
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
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || !prescription) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/prescriptions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Prescription</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Prescription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" /> 
              Prescription Details
            </CardTitle>
            <CardDescription>
              Edit the prescription information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="patientId">Patient</Label>
                  <Select 
                    onValueChange={handlePatientChange}
                    value={prescription.patientId}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id || ''}>
                          {`${patient.firstName} ${patient.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="medication">Medication</Label>
                  <Input 
                    id="medication"
                    value={prescription.medication}
                    onChange={(e) => handleInputChange('medication', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input 
                    id="dosage"
                    value={prescription.dosage}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input 
                    id="frequency"
                    value={prescription.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    placeholder="e.g. 3 times a day"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration"
                    value={prescription.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g. 10 days"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={prescription.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea 
                    id="instructions"
                    value={prescription.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Take with water after meals..."
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    onValueChange={handleStatusChange}
                    value={prescription.status}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={prescription.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="notes"
                    value={prescription.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes..."
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Prescribed By</Label>
                  <Input 
                    value={prescription.prescribedBy}
                    onChange={(e) => handleInputChange('prescribedBy', e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/prescriptions')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this prescription. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrescription}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 