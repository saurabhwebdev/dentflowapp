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
import { Loader2, Search, PlusCircle, Pencil, Trash2, Receipt, FileDown } from "lucide-react";
import { Invoice, InvoiceItem, getInvoices, deleteInvoice, addInvoice, generateInvoiceNumber } from "@/lib/invoiceService";
import { Patient, getPatients } from "@/lib/patientService";
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

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [clinicSettings, setClinicSettings] = useState<AppSettings | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  // New invoice form state
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    invoiceNumber: '',
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentStatus: 'pending',
    notes: ''
  });

  // Invoice item state for adding items
  const [invoiceItem, setInvoiceItem] = useState<InvoiceItem>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0
  });
  
  // Load invoices
  useEffect(() => {
    async function loadInvoices() {
      if (user) {
        try {
          const fetchedInvoices = await getInvoices(user);
          setInvoices(fetchedInvoices);
          
          // Also load patients for the add invoice form
          const fetchedPatients = await getPatients(user);
          setPatients(fetchedPatients);
          
          // Load clinic settings for PDF generation
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
          
          // Set currency symbol
          const symbol = getCurrencySymbol(settings.financial.currency);
          setCurrencySymbol(symbol);
          
          // Use tax rate from settings for new invoices
          if (settings.financial.taxRate) {
            setNewInvoice(prev => ({
              ...prev,
              tax: parseFloat(settings.financial.taxRate)
            }));
          }
          
          // Generate invoice number
          const invoiceNumber = await generateInvoiceNumber(user);
          setNewInvoice(prev => ({ ...prev, invoiceNumber }));
        } catch (error) {
          console.error("Error loading invoices:", error);
          toast({
            title: "Error",
            description: "Failed to load invoices",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading) {
      loadInvoices();
    }
  }, [user, authLoading]);
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle invoice deletion
  const handleDeleteInvoice = async () => {
    if (!user || !invoiceToDelete) return;
    
    try {
      await deleteInvoice(user, invoiceToDelete);
      setInvoices(invoices.filter(p => p.id !== invoiceToDelete));
      toast({
        title: "Success",
        description: "Invoice has been deleted",
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };
  
  // Update calculations when invoice items change
  useEffect(() => {
    // Calculate subtotal
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply tax and discount to get total
    const tax = (subtotal * (newInvoice.tax / 100));
    const total = subtotal + tax - newInvoice.discount;
    
    setNewInvoice(prev => ({
      ...prev,
      subtotal,
      total
    }));
  }, [newInvoice.items, newInvoice.tax, newInvoice.discount]);
  
  // Handle add item to invoice
  const handleAddItem = () => {
    if (!invoiceItem.description || invoiceItem.quantity <= 0 || invoiceItem.unitPrice <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please enter a description, quantity, and unit price",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate amount
    const amount = invoiceItem.quantity * invoiceItem.unitPrice;
    const newItem = { ...invoiceItem, amount };
    
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Reset item form
    setInvoiceItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
  };
  
  // Handle remove item from invoice
  const handleRemoveItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  // Handle add invoice
  const handleAddInvoice = async () => {
    if (!user) return;
    
    if (!newInvoice.patientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    
    if (newInvoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find patient name from selected patient ID
      const selectedPatient = patients.find(p => p.id === newInvoice.patientId);
      if (selectedPatient) {
        const invoiceWithPatientName = {
          ...newInvoice,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          createdBy: user.uid
        };
        
        const addedInvoice = await addInvoice(user, invoiceWithPatientName);
        setInvoices([addedInvoice, ...invoices]);
        
        toast({
          title: "Success",
          description: "New invoice has been created",
        });
        
        // Reset form and generate new invoice number
        const invoiceNumber = await generateInvoiceNumber(user);
        setNewInvoice({
          invoiceNumber,
          patientId: '',
          patientName: '',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          paymentStatus: 'pending',
          notes: ''
        });
        setIsAddDialogOpen(false);
      } else {
        throw new Error("Selected patient not found");
      }
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast({
        title: "Error",
        description: "Failed to add invoice",
        variant: "destructive",
      });
    }
  };
  
  // Handle download PDF
  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!clinicSettings) {
      toast({
        title: "Error",
        description: "Clinic settings not loaded",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get patient data
      const patient = patients.find(p => p.id === invoice.patientId) || null;
      
      // Generate PDF
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
  
  // Update invoice item as typed
  const handleInvoiceItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setInvoiceItem(prev => {
      const updatedItem = { ...prev, [name]: name === 'description' ? value : Number(value) };
      
      // Auto-calculate amount if quantity or unitPrice changes
      if (name === 'quantity' || name === 'unitPrice') {
        updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
      }
      
      return updatedItem;
    });
  };
  
  // Loading state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    router.push("/");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">
          Manage your patient invoices and payments
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Invoice List</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Create an invoice for a patient. Add items, tax, and discount as needed.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <Input
                          id="invoiceNumber"
                          value={newInvoice.invoiceNumber}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="patientId">Patient <span className="text-red-500">*</span></Label>
                        <Select
                          value={newInvoice.patientId}
                          onValueChange={(value) => 
                            setNewInvoice(prev => ({ ...prev, patientId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.id!}>
                                {patient.firstName} {patient.lastName}
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
                          value={newInvoice.date}
                          onChange={(e) => 
                            setNewInvoice(prev => ({ ...prev, date: e.target.value }))
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={newInvoice.dueDate}
                          onChange={(e) => 
                            setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Invoice Items</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Current items table */}
                        {newInvoice.items.length > 0 ? (
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
                              {newInvoice.items.map((item, index) => (
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
                          <div className="text-center py-4 text-muted-foreground border rounded-md">
                            No items added yet. Use the form below to add invoice items.
                          </div>
                        )}
                        
                        {/* Add item form */}
                        <div className="grid grid-cols-12 gap-2 border p-4 rounded-md bg-muted/30">
                          <div className="col-span-5">
                            <Input
                              placeholder="Description"
                              name="description"
                              value={invoiceItem.description}
                              onChange={handleInvoiceItemChange}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Qty"
                              name="quantity"
                              type="number"
                              min="1"
                              value={invoiceItem.quantity}
                              onChange={handleInvoiceItemChange}
                            />
                          </div>
                          <div className="col-span-2">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                {currencySymbol}
                              </span>
                              <Input
                                placeholder="Price"
                                name="unitPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={invoiceItem.unitPrice}
                                onChange={handleInvoiceItemChange}
                                className="pl-6"
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Amount"
                              value={`${currencySymbol}${invoiceItem.amount.toFixed(2)}`}
                              readOnly
                              className="bg-muted/50"
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleAddItem}
                              title="Add Item"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="paymentStatus">Payment Status</Label>
                            <Select
                              value={newInvoice.paymentStatus}
                              onValueChange={(value: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled') => 
                                setNewInvoice(prev => ({ ...prev, paymentStatus: value }))
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
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              value={newInvoice.notes}
                              onChange={(e) => 
                                setNewInvoice(prev => ({ ...prev, notes: e.target.value }))
                              }
                              rows={4}
                              placeholder="Add payment notes or instructions..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span>Subtotal:</span>
                              <span className="font-medium">{currencySymbol}{newInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span>Tax (%):</span>
                                <Input
                                  className="w-20 h-8"
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={newInvoice.tax}
                                  onChange={(e) => 
                                    setNewInvoice(prev => ({ ...prev, tax: Number(e.target.value) }))
                                  }
                                />
                              </div>
                              <span>{currencySymbol}{(newInvoice.subtotal * (newInvoice.tax / 100)).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span>Discount:</span>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    {currencySymbol}
                                  </span>
                                  <Input
                                    className="w-24 h-8 pl-6"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newInvoice.discount}
                                    onChange={(e) => 
                                      setNewInvoice(prev => ({ ...prev, discount: Number(e.target.value) }))
                                    }
                                  />
                                </div>
                              </div>
                              <span>{currencySymbol}{newInvoice.discount.toFixed(2)}</span>
                            </div>
                            
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span>{currencySymbol}{newInvoice.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {clinicSettings?.financial.paymentTerms && (
                              <div className="text-sm text-muted-foreground pt-2">
                                Payment Terms: Net {clinicSettings.financial.paymentTerms} days
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddInvoice}
                      disabled={newInvoice.items.length === 0 || !newInvoice.patientId}
                    >
                      Create Invoice
                    </Button>
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {searchTerm ? "No invoices found matching your search." : "No invoices found. Create your first invoice to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.patientName}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="text-right">{currencySymbol}{invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                          invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          invoice.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                          invoice.paymentStatus === 'partial' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInvoiceToDelete(invoice.id || null);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete"
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
              This will permanently delete this invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setInvoiceToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 