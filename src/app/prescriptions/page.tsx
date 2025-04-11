"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, PlusCircle, Pencil, Trash2, Pill, FileDown } from "lucide-react";
import { Prescription, getPrescriptions, deletePrescription, addPrescription } from "@/lib/prescriptionService";
import { Patient, getPatients } from "@/lib/patientService";
import { Textarea } from "@/components/ui/textarea";
import { getUserSettings } from "@/lib/settingsService";
import { generatePrescriptionPDF } from "@/lib/pdfUtils";

export default function PrescriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  
  // New prescription form state
  const [newPrescription, setNewPrescription] = useState<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    patientId: '',
    patientName: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    startDate: new Date().toISOString().split('T')[0],
    instructions: '',
    status: 'active',
    prescribedBy: '',
    notes: ''
  });
  
  // Load prescriptions
  useEffect(() => {
    async function loadPrescriptions() {
      if (user) {
        try {
          const fetchedPrescriptions = await getPrescriptions(user);
          setPrescriptions(fetchedPrescriptions);
          
          // Also load patients for the add prescription form
          const fetchedPatients = await getPatients(user);
          setPatients(fetchedPatients);
          
          // Load clinic settings for PDF generation
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
        } catch (error) {
          console.error("Error loading prescriptions:", error);
          toast({
            title: "Error",
            description: "Failed to load prescriptions",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading) {
      loadPrescriptions();
    }
  }, [user, authLoading]);
  
  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle prescription deletion
  const handleDeletePrescription = async () => {
    if (!user || !prescriptionToDelete) return;
    
    try {
      await deletePrescription(user, prescriptionToDelete);
      setPrescriptions(prescriptions.filter(p => p.id !== prescriptionToDelete));
      toast({
        title: "Success",
        description: "Prescription has been deleted",
      });
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
    }
  };
  
  // Handle add prescription
  const handleAddPrescription = async () => {
    if (!user) return;
    
    try {
      // Find patient name from selected patient ID
      const selectedPatient = patients.find(p => p.id === newPrescription.patientId);
      if (selectedPatient) {
        const prescriptionWithPatientName = {
          ...newPrescription,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          prescribedBy: user.displayName || user.email || "Doctor",
          createdBy: user.uid
        };
        
        const addedPrescription = await addPrescription(user, prescriptionWithPatientName);
        setPrescriptions([addedPrescription, ...prescriptions]);
        
        toast({
          title: "Success",
          description: "New prescription has been added",
        });
        
        // Reset form
        setNewPrescription({
          patientId: '',
          patientName: '',
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          startDate: new Date().toISOString().split('T')[0],
          instructions: '',
          status: 'active',
          prescribedBy: '',
          notes: ''
        });
        setIsAddDialogOpen(false);
      } else {
        throw new Error("Selected patient not found");
      }
    } catch (error) {
      console.error("Error adding prescription:", error);
      toast({
        title: "Error",
        description: "Failed to add prescription",
        variant: "destructive",
      });
    }
  };
  
  // Handle PDF download
  const handleDownloadPDF = (prescription: Prescription) => {
    if (!clinicSettings) {
      toast({
        title: "Error",
        description: "Cannot generate PDF. Missing clinic data.",
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
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground">
          Manage your patient prescriptions
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Prescription List</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Prescription</DialogTitle>
                    <DialogDescription>
                      Create a new prescription for a patient.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="patientId">Patient *</Label>
                      <Select 
                        onValueChange={(value) => 
                          setNewPrescription({...newPrescription, patientId: value})
                        }
                        value={newPrescription.patientId}
                      >
                        <SelectTrigger id="patientId">
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="medication">Medication *</Label>
                        <Input 
                          id="medication" 
                          value={newPrescription.medication}
                          onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dosage">Dosage *</Label>
                        <Input 
                          id="dosage" 
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="frequency">Frequency *</Label>
                        <Input 
                          id="frequency" 
                          value={newPrescription.frequency}
                          onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                          placeholder="e.g. 3 times a day"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration *</Label>
                        <Input 
                          id="duration" 
                          value={newPrescription.duration}
                          onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                          placeholder="e.g. 10 days"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input 
                          id="startDate" 
                          type="date"
                          value={newPrescription.startDate}
                          onChange={(e) => setNewPrescription({...newPrescription, startDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="instructions">Instructions *</Label>
                      <Textarea 
                        id="instructions" 
                        value={newPrescription.instructions}
                        onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                        placeholder="Take with water after meals..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select 
                          onValueChange={(value) => 
                            setNewPrescription({
                              ...newPrescription, 
                              status: value as 'active' | 'completed' | 'cancelled'
                            })
                          }
                          value={newPrescription.status}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          value={newPrescription.endDate || ''}
                          onChange={(e) => setNewPrescription({...newPrescription, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea 
                        id="notes" 
                        value={newPrescription.notes || ''}
                        onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddPrescription}>Add Prescription</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No prescriptions found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">
                      {prescription.patientName}
                    </TableCell>
                    <TableCell>{prescription.medication}</TableCell>
                    <TableCell>{prescription.dosage}</TableCell>
                    <TableCell>{prescription.frequency}</TableCell>
                    <TableCell>{prescription.startDate}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prescription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : prescription.status === 'completed' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(prescription)}
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                          title="Edit Prescription"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setPrescriptionToDelete(prescription.id || '');
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete Prescription"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
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
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setPrescriptionToDelete(null);
            }}>
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