"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Package, Save, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { InventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem, updateInventoryQuantity } from "@/lib/inventoryService";
import { getUserSettings } from "@/lib/settingsService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Standard dental inventory categories
const inventoryCategories = [
  "Consumables",
  "Instruments",
  "Equipment",
  "PPE",
  "Impression Materials",
  "Orthodontic Supplies",
  "Restorative Materials",
  "Anesthetics",
  "Infection Control",
  "Office Supplies",
  "Other"
];

// Standard units for dental inventory
const inventoryUnits = [
  "Piece",
  "Box",
  "Pack",
  "Kit",
  "Bottle",
  "Tube",
  "Syringe",
  "Cartridge",
  "Pair",
  "Set",
  "Roll",
  "Sheet",
  "Case",
  "Bag",
  "Other"
];

export default function InventoryItemPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string;
  
  // State
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [isLowStock, setIsLowStock] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  // Load item
  useEffect(() => {
    async function loadInventoryItem() {
      if (user && itemId) {
        setIsLoading(true);
        try {
          // Get all items and find the one we want
          const inventoryItems = await getInventoryItems(user);
          const foundItem = inventoryItems.find(i => i.id === itemId);
          
          if (!foundItem) {
            toast({
              title: "Error",
              description: "Inventory item not found",
              variant: "destructive",
            });
            router.push('/inventory');
            return;
          }
          
          setItem(foundItem);
          setIsLowStock(foundItem.quantity <= foundItem.minQuantity);
          
          // Load currency symbol from settings
          const settings = await getUserSettings(user);
          if (settings?.financial?.currency) {
            const symbols: { [key: string]: string } = {
              'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
              'JPY': '¥', 'CAD': 'CA$', 'AUD': 'A$', 'CNY': '¥'
            };
            setCurrencySymbol(symbols[settings.financial.currency] || '$');
          }
        } catch (error) {
          console.error("Error loading inventory item:", error);
          toast({
            title: "Error",
            description: "Failed to load inventory item",
            variant: "destructive",
          });
          router.push('/inventory');
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading) {
      loadInventoryItem();
    }
  }, [user, authLoading, itemId, router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!item) return;
    
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Convert numeric values
    if (name === 'quantity' || name === 'minQuantity' || name === 'price') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    // Check if we need to update low stock status
    if (name === 'quantity' || name === 'minQuantity') {
      if (name === 'quantity') {
        setIsLowStock(parsedValue <= item.minQuantity);
      } else if (name === 'minQuantity') {
        setIsLowStock(item.quantity <= parsedValue);
      }
    }
    
    setItem(prev => prev ? { ...prev, [name]: parsedValue } : null);
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (!item) return;
    setItem(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // Handle saving item
  const handleSaveItem = async () => {
    if (!user || !item) return;
    
    setIsSaving(true);
    try {
      const { id, createdBy, createdAt, updatedAt, ...itemData } = item;
      
      await updateInventoryItem(user, id, itemData);
      
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete item
  const handleDeleteItem = async () => {
    if (!user || !item) return;
    
    try {
      await deleteInventoryItem(user, item.id);
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
      
      router.push('/inventory');
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
    }
  };
  
  // Handle restock
  const handleRestock = async () => {
    if (!user || !item) return;
    
    try {
      const newQuantity = item.quantity + restockQuantity;
      await updateInventoryQuantity(user, item.id, newQuantity, true);
      
      // Update state
      setItem(prev => prev ? {
        ...prev,
        quantity: newQuantity,
        lastRestock: new Date().toISOString().split('T')[0]
      } : null);
      
      // Check if still low stock
      setIsLowStock(newQuantity <= (item?.minQuantity || 0));
      
      toast({
        title: "Success",
        description: `Restocked ${item.name} with ${restockQuantity} ${item.unit}(s)`,
      });
    } catch (error) {
      console.error("Error restocking inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    } finally {
      setRestockDialogOpen(false);
      setRestockQuantity(0);
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading inventory item...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated or item not found
  if (!user || !item) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/inventory")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">
            {item.name}
            {isLowStock && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <AlertTriangle className="mr-1 h-3 w-3" /> Low Stock
              </span>
            )}
          </h1>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage inventory item details
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRestockQuantity(0);
              setRestockDialogOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Restock</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-6">
          <TabsTrigger value="details">Item Details</TabsTrigger>
          <TabsTrigger value="supplier">Supplier & Stock</TabsTrigger>
        </TabsList>
        
        {/* Item Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
              <CardDescription>
                Basic details about the inventory item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={item.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={item.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input 
                    id="sku" 
                    name="sku" 
                    value={item.sku} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Current Quantity</Label>
                  <Input 
                    id="quantity" 
                    name="quantity" 
                    type="number" 
                    min="0" 
                    value={item.quantity} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Min. Quantity</Label>
                  <Input 
                    id="minQuantity" 
                    name="minQuantity" 
                    type="number" 
                    min="0" 
                    value={item.minQuantity} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">{currencySymbol}</span>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="pl-7"
                      value={item.price} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={item.location} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={item.notes} 
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this inventory item.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleSaveItem} disabled={isSaving}>
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
        
        {/* Supplier & Stock Tab */}
        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>
                Supplier details and stock information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier Name</Label>
                  <Input 
                    id="supplier" 
                    name="supplier" 
                    value={item.supplier} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplierContact">Supplier Contact</Label>
                  <Input 
                    id="supplierContact" 
                    name="supplierContact" 
                    value={item.supplierContact} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lastRestock">Last Restocked</Label>
                  <Input 
                    id="lastRestock" 
                    name="lastRestock" 
                    type="date" 
                    value={item.lastRestock} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input 
                    id="expiryDate" 
                    name="expiryDate" 
                    type="date" 
                    value={item.expiryDate} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-2">
                <h3 className="font-medium">Stock Status</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-3 flex-1">
                    <div className="text-sm text-muted-foreground">Current Stock</div>
                    <div className="text-2xl font-semibold mt-1">
                      {item.quantity} <span className="text-base font-normal">{item.unit}(s)</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-3 flex-1">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className={`text-lg font-semibold mt-1 flex items-center ${
                      isLowStock ? "text-amber-600" : "text-green-600"
                    }`}>
                      {isLowStock ? (
                        <>
                          <AlertTriangle className="mr-1 h-4 w-4" /> 
                          Low Stock
                        </>
                      ) : (
                        <>
                          <Package className="mr-1 h-4 w-4" /> 
                          In Stock
                        </>
                      )}
                    </div>
                  </div>
                  
                  {item.price > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-3 flex-1">
                      <div className="text-sm text-muted-foreground">Total Value</div>
                      <div className="text-2xl font-semibold mt-1">
                        {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setRestockQuantity(0);
                  setRestockDialogOpen(true);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Restock Item
              </Button>
              
              <Button onClick={handleSaveItem} disabled={isSaving}>
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
      
      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restock Inventory</DialogTitle>
            <DialogDescription>
              Add more items to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">
                Current stock: {item.quantity} {item.unit}(s)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restockQuantity">Add Quantity</Label>
              <Input
                id="restockQuantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={handleRestock}
              disabled={!restockQuantity || restockQuantity <= 0}
            >
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 