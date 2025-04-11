"use client";

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
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, ArrowLeft, Save, Trash2, Receipt, FileDown, MoreHorizontal, PlusCircle } from "lucide-react";
import { Invoice, InvoiceItem, getInvoice, updateInvoice, deleteInvoice } from "@/lib/invoiceService";
import { Patient, getPatient, getPatients } from "@/lib/patientService";
import { Textarea } from "@/components/ui/textarea";
import { getUserSettings, AppSettings } from "@/lib/settingsService";
import { generateInvoicePDF } from "@/lib/pdfUtils";

// Helper function to get currency symbol
function getCurrencySymbol(currencyCode: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$', 
    'EUR': '€', 
    'GBP': '£', 
    'JPY': '¥', 
    'CAD': 'CA$', 
    'AUD': 'A$', 
    'INR': '₹', 
    'CNY': '¥',
    'BRL': 'R$',
    'MXN': '$',
    'ZAR': 'R',
    'SGD': 'S$',
    'NZD': 'NZ$',
    'CHF': 'CHF',
    'HKD': 'HK$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'AED': 'د.إ',
    'SAR': '﷼',
    'QAR': '﷼',
    'RUB': '₽',
    'TRY': '₺',
    'THB': '฿',
    'IDR': 'Rp',
    'MYR': 'RM',
    'PHP': '₱',
    'VND': '₫',
    'KRW': '₩',
    'TWD': 'NT$'
  };
  
  return currencySymbols[currencyCode] || '$';
}

export default function InvoiceDetailPage() {
  // Get the invoice ID from the route parameters
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<AppSettings | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  // Track edits
  const [hasChanges, setHasChanges] = useState(false);
  
  // Invoice item state for adding items
  const [tempItem, setTempItem] = useState<InvoiceItem>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0
  });
  
  // Load invoice data
  useEffect(() => {
    async function loadInvoiceData() {
      if (!user || !invoiceId) return;
      
      try {
        setLoading(true);
        
        // Load invoice
        const invoiceData = await getInvoice(user, invoiceId);
        if (!invoiceData) {
          toast({
            title: "Error",
            description: "Invoice not found",
            variant: "destructive",
          });
          router.push("/invoices");
          return;
        }
        
        setInvoice(invoiceData);
        
        // Load patient
        if (invoiceData.patientId) {
          const patientData = await getPatient(user, invoiceData.patientId);
          setPatient(patientData);
        }
        
        // Load all patients for dropdown
        const patientsData = await getPatients(user);
        setPatients(patientsData);
        
        // Load clinic settings for PDF generation
        const settings = await getUserSettings(user);
        setClinicSettings(settings);
        
        // Set currency symbol
        const symbol = getCurrencySymbol(settings.financial.currency);
        setCurrencySymbol(symbol);
        
        // If tax rate is not set in invoice but available in settings, use the settings value
        if (invoiceData.tax === 0 && settings.financial.taxRate) {
          setInvoice(prev => {
            if (!prev) return null;
            return {
              ...prev,
              tax: parseFloat(settings.financial.taxRate)
            };
          });
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      loadInvoiceData();
    }
  }, [user, authLoading, invoiceId, router]);
  
  // Update calculations when invoice items change
  useEffect(() => {
    if (!invoice) return;
    
    // Calculate subtotal
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply tax and discount to get total
    const tax = (subtotal * (invoice.tax / 100));
    const total = subtotal + tax - invoice.discount;
    
    if (subtotal !== invoice.subtotal || total !== invoice.total) {
      setInvoice(prev => {
        if (!prev) return null;
        return {
          ...prev,
          subtotal,
          total
        };
      });
      setHasChanges(true);
    }
  }, [invoice?.items, invoice?.tax, invoice?.discount]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!invoice) return;
    
    setInvoice({
      ...invoice,
      [name]: value
    });
    setHasChanges(true);
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (!invoice) return;
    
    setInvoice({
      ...invoice,
      [name]: value
    });
    setHasChanges(true);
    
    // If patient is changed, update patient info
    if (name === 'patientId') {
      const selectedPatient = patients.find(p => p.id === value);
      if (selectedPatient) {
        setPatient(selectedPatient);
        setInvoice(prev => {
          if (!prev) return null;
          return {
            ...prev,
            patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`
          };
        });
      }
    }
  };
  
  // Handle save invoice
  const handleSaveInvoice = async () => {
    if (!user || !invoice || !invoice.id) return;
    
    setSaving(true);
    
    try {
      await updateInvoice(user, invoice.id, invoice);
      
      toast({
        title: "Success",
        description: "Invoice has been updated",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle delete invoice
  const handleDeleteInvoice = async () => {
    if (!user || !invoice || !invoice.id) return;
    
    try {
      await deleteInvoice(user, invoice.id);
      
      toast({
        title: "Success",
        description: "Invoice has been deleted",
      });
      
      router.push("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle download PDF
  const handleDownloadPDF = () => {
    if (!invoice || !clinicSettings) {
      toast({
        title: "Error",
        description: "Invoice data or clinic settings not loaded",
        variant: "destructive",
      });
      return;
    }
    
    try {
      generateInvoicePDF(invoice, patient as Patient, clinicSettings);
      
      toast({
        title: "Success",
        description: "Invoice PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };
  
  // Handle invoice item changes
  const handleInvoiceItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setTempItem(prev => {
      const updatedItem = { ...prev, [name]: name === 'description' ? value : Number(value) };
      
      // Auto-calculate amount if quantity or unitPrice changes
      if (name === 'quantity' || name === 'unitPrice') {
        updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
      }
      
      return updatedItem;
    });
  };
  
  // Handle add item to invoice
  const handleAddItem = () => {
    if (!invoice) return;
    
    if (!tempItem.description || tempItem.quantity <= 0 || tempItem.unitPrice <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please enter a description, quantity, and unit price",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate amount
    const amount = tempItem.quantity * tempItem.unitPrice;
    const newItem = { ...tempItem, amount };
    
    setInvoice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: [...prev.items, newItem]
      };
    });
    
    // Reset item form
    setTempItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
    
    setHasChanges(true);
  };
  
  // Handle remove item from invoice
  const handleRemoveItem = (index: number) => {
    if (!invoice) return;
    
    setInvoice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
    });
    
    setHasChanges(true);
  };
  
  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading invoice data...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    router.push("/");
    return null;
  }
  
  // Check if invoice is loaded
  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Invoice Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <p>The requested invoice could not be found or you do not have permission to view it.</p>
            <Button className="mt-4" onClick={() => router.push("/invoices")}>
              Return to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            {invoice.date} • {invoice.patientName}
          </p>
        </div>
        
        <div className="ml-auto flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={saving}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          <Button
            onClick={handleSaveInvoice}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Invoice Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                    Delete Invoice
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete invoice #{invoice.invoiceNumber}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoiceNumber"
                    value={invoice.invoiceNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={invoice.patientId}
                    onValueChange={(value) => handleSelectChange('patientId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id!}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={invoice.date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Invoice Items</Label>
                </div>
                
                {invoice.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{currencySymbol}{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{currencySymbol}{item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No items in this invoice. Add items below.
                  </div>
                )}
                
                {/* Add item form */}
                <div className="grid grid-cols-12 gap-2 border p-4 rounded-md">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      name="description"
                      value={tempItem.description}
                      onChange={handleInvoiceItemChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Qty"
                      name="quantity"
                      type="number"
                      min="1"
                      value={tempItem.quantity}
                      onChange={handleInvoiceItemChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Price"
                      name="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempItem.unitPrice}
                      onChange={handleInvoiceItemChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Amount"
                      value={`${currencySymbol}${tempItem.amount.toFixed(2)}`}
                      readOnly
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddItem}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>Tax (%):</span>
                      <Input
                        className="w-20 h-8"
                        name="tax"
                        type="number"
                        min="0"
                        step="0.1"
                        value={invoice.tax}
                        onChange={handleInputChange}
                      />
                    </div>
                    <span>{currencySymbol}{(invoice.subtotal * (invoice.tax / 100)).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>Discount:</span>
                      <Input
                        className="w-20 h-8"
                        name="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoice.discount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <span>{currencySymbol}{invoice.discount.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span>{currencySymbol}{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Status</Label>
                    <Select
                      value={invoice.paymentStatus}
                      onValueChange={(value: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled') => 
                        handleSelectChange('paymentStatus', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {invoice.paymentStatus === 'paid' || invoice.paymentStatus === 'partial' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                          value={invoice.paymentMethod || ''}
                          onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit">Credit Card</SelectItem>
                            <SelectItem value="debit">Debit Card</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="paymentDate">Payment Date</Label>
                        <Input
                          id="paymentDate"
                          name="paymentDate"
                          type="date"
                          value={invoice.paymentDate || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="notes"
                  placeholder="Add notes or payment instructions..."
                  value={invoice.notes || ''}
                  onChange={handleInputChange}
                  rows={5}
                />
              </CardContent>
            </Card>
            
            {patient && (
              <Card>
                <CardHeader>
                  <CardTitle>Patient Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {patient.address}, {patient.city}, {patient.state} {patient.zip}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 