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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, PlusCircle, Pencil, Trash2, Package, AlertTriangle, RefreshCw, MinusCircle } from "lucide-react";
import { InventoryItem, getInventoryItems, addInventoryItem, deleteInventoryItem, updateInventoryQuantity, generateSKU, getLowStockItems } from "@/lib/inventoryService";
import { getUserSettings } from "@/lib/settingsService";

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

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [itemToRestock, setItemToRestock] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [reduceStockDialogOpen, setReduceStockDialogOpen] = useState(false);
  const [itemToReduceStock, setItemToReduceStock] = useState<InventoryItem | undefined>(undefined);
  const [reduceQuantity, setReduceQuantity] = useState<number>(0);
  
  // Form state
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    unit: "Piece",
    minQuantity: 5,
    price: 0,
    supplier: "",
    supplierContact: "",
    location: "",
    expiryDate: "",
    lastRestock: new Date().toISOString().split('T')[0],
    notes: ""
  });
  
  // Load inventory and settings
  useEffect(() => {
    async function loadInventory() {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedItems = await getInventoryItems(user);
          setInventoryItems(fetchedItems);
          
          // Get low stock items
          const lowItems = await getLowStockItems(user);
          setLowStockItems(lowItems);
          
          // Load clinic settings
          const settings = await getUserSettings(user);
          setClinicSettings(settings);
          
          // Set currency symbol based on settings
          if (settings?.financial?.currency) {
            const symbols: { [key: string]: string } = {
              'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
              'JPY': '¥', 'CAD': 'CA$', 'AUD': 'A$', 'CNY': '¥'
            };
            setCurrencySymbol(symbols[settings.financial.currency] || '$');
          }
        } catch (error) {
          console.error("Error loading inventory:", error);
          toast({
            title: "Error",
            description: "Failed to load inventory items",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!authLoading) {
      loadInventory();
    }
  }, [user, authLoading]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);
  
  // Filter inventory items
  const filteredItems = showLowStockOnly
    ? lowStockItems
    : inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Handle auto-generation of SKU when category is selected
  const handleCategoryChange = async (category: string) => {
    if (!user || !category) return;
    
    try {
      const sku = await generateSKU(user, category);
      setNewItem(prev => ({ ...prev, category, sku }));
    } catch (error) {
      console.error("Error generating SKU:", error);
      // Still update the category even if SKU generation fails
      setNewItem(prev => ({ ...prev, category }));
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Convert numeric values
    if (name === 'quantity' || name === 'minQuantity' || name === 'price') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setNewItem(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  // Handle add inventory item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate form
    if (!newItem.name || !newItem.category || !newItem.sku) {
      toast({
        title: "Missing Information",
        description: "Please provide at least name, category, and SKU",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const itemId = await addInventoryItem(user, newItem);
      
      // Add the new item to the state
      const itemWithId = {
        ...newItem,
        id: itemId,
        createdBy: user.uid,
      } as InventoryItem;
      
      setInventoryItems(prev => [...prev, itemWithId]);
      
      // Check if this is low stock and update that list if needed
      if (itemWithId.quantity <= itemWithId.minQuantity) {
        setLowStockItems(prev => [...prev, itemWithId]);
      }
      
      // Reset form
      setNewItem({
        name: "",
        category: "",
        sku: "",
        quantity: 0,
        unit: "Piece",
        minQuantity: 5,
        price: 0,
        supplier: "",
        supplierContact: "",
        location: "",
        expiryDate: "",
        lastRestock: new Date().toISOString().split('T')[0],
        notes: ""
      });
      
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    }
  };
  
  // Handle delete inventory item
  const handleDeleteItem = async () => {
    if (!user || !itemToDelete) return;
    
    try {
      await deleteInventoryItem(user, itemToDelete);
      
      // Remove from the state
      setInventoryItems(prev => prev.filter(item => item.id !== itemToDelete));
      setLowStockItems(prev => prev.filter(item => item.id !== itemToDelete));
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
    }
  };
  
  // Handle restock inventory item
  const handleRestockItem = async () => {
    if (!user || !itemToRestock) return;
    
    try {
      const newQuantity = itemToRestock.quantity + restockQuantity;
      await updateInventoryQuantity(user, itemToRestock.id, newQuantity, true);
      
      // Update state
      const updatedItems = inventoryItems.map(item => 
        item.id === itemToRestock.id 
          ? { 
              ...item, 
              quantity: newQuantity, 
              lastRestock: new Date().toISOString().split('T')[0] 
            } 
          : item
      );
      
      setInventoryItems(updatedItems);
      
      // Update low stock items
      const updatedItem = updatedItems.find(item => item.id === itemToRestock.id);
      if (updatedItem) {
        if (updatedItem.quantity <= updatedItem.minQuantity) {
          // Still low stock, update the list
          setLowStockItems(prev => prev.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          ));
        } else {
          // No longer low stock, remove from list
          setLowStockItems(prev => prev.filter(item => item.id !== updatedItem.id));
        }
      }
      
      toast({
        title: "Success",
        description: `Restocked ${itemToRestock.name} with ${restockQuantity} ${itemToRestock.unit}(s)`,
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
      setItemToRestock(null);
      setRestockQuantity(0);
    }
  };
  
  // Handle reduce stock for inventory item
  const handleReduceStock = async () => {
    if (!user || !itemToReduceStock) return;
    
    if (reduceQuantity > itemToReduceStock.quantity) {
      toast({
        title: "Error",
        description: "Cannot reduce by more than the current quantity",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newQuantity = itemToReduceStock.quantity - reduceQuantity;
      await updateInventoryQuantity(user, itemToReduceStock.id, newQuantity, false);
      
      // Update state
      const updatedItems = inventoryItems.map(item => 
        item.id === itemToReduceStock.id 
          ? { 
              ...item, 
              quantity: newQuantity
            } 
          : item
      );
      
      setInventoryItems(updatedItems);
      
      // Update low stock items
      const updatedItem = updatedItems.find(item => item.id === itemToReduceStock.id);
      if (updatedItem) {
        if (updatedItem.quantity <= updatedItem.minQuantity) {
          // Item is now low stock, add to list if not already there
          if (!lowStockItems.some(item => item.id === updatedItem.id)) {
            setLowStockItems(prev => [...prev, updatedItem]);
          } else {
            // Already in low stock, just update it
            setLowStockItems(prev => prev.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ));
          }
        }
      }
      
      toast({
        title: "Success",
        description: `Reduced ${itemToReduceStock.name} by ${reduceQuantity} ${itemToReduceStock.unit}(s)`,
      });
    } catch (error) {
      console.error("Error reducing inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    } finally {
      setReduceStockDialogOpen(false);
      setItemToReduceStock(undefined);
      setReduceQuantity(0);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
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
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your dental practice inventory and supplies
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your inventory. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddItem} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Item Name *</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={newItem.name} 
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={handleCategoryChange}
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input 
                          id="sku" 
                          name="sku" 
                          value={newItem.sku} 
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input 
                          id="quantity" 
                          name="quantity" 
                          type="number" 
                          min="0" 
                          value={newItem.quantity} 
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit *</Label>
                        <Select
                          value={newItem.unit}
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="minQuantity">Min. Quantity</Label>
                        <Input 
                          id="minQuantity" 
                          name="minQuantity" 
                          type="number" 
                          min="0" 
                          value={newItem.minQuantity} 
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
                            value={newItem.price} 
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input 
                          id="supplier" 
                          name="supplier" 
                          value={newItem.supplier} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="supplierContact">Supplier Contact</Label>
                        <Input 
                          id="supplierContact" 
                          name="supplierContact" 
                          value={newItem.supplierContact} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Storage Location</Label>
                        <Input 
                          id="location" 
                          name="location" 
                          value={newItem.location} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input 
                          id="expiryDate" 
                          name="expiryDate" 
                          type="date" 
                          value={newItem.expiryDate} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                          id="notes" 
                          name="notes" 
                          value={newItem.notes} 
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit">Add to Inventory</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              {lowStockItems.length > 0 && (
                <Button
                  variant={showLowStockOnly ? "default" : "outline"}
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {showLowStockOnly ? "Show All" : `Low Stock (${lowStockItems.length})`}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.quantity <= item.minQuantity ? "text-red-500 font-medium" : ""}>
                        {item.quantity} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{currencySymbol}{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToReduceStock(item);
                            setReduceQuantity(0);
                            setReduceStockDialogOpen(true);
                          }}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToRestock(item);
                            setRestockQuantity(0);
                            setRestockDialogOpen(true);
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/inventory/${item.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this inventory item? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => {
                                  setItemToDelete(item.id);
                                  handleDeleteItem();
                                }}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              {searchTerm ? "No items match your search criteria" : "No inventory items added yet"}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Update the quantity for {itemToRestock?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Add Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestockItem}>
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={reduceStockDialogOpen} onOpenChange={setReduceStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reduce Stock</DialogTitle>
            <DialogDescription>
              Record usage or loss of {itemToReduceStock?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {itemToReduceStock && (
              <div className="text-sm mb-2">
                Current stock: <span className="font-medium">{itemToReduceStock.quantity} {itemToReduceStock.unit}(s)</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reduceQuantity">Remove Quantity</Label>
              <Input
                id="reduceQuantity"
                type="number"
                min="1"
                max={itemToReduceStock?.quantity || 1}
                value={reduceQuantity}
                onChange={(e) => setReduceQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReduceStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReduceStock}
              disabled={!reduceQuantity || reduceQuantity <= 0 || (itemToReduceStock && reduceQuantity > itemToReduceStock.quantity)}
            >
              Reduce Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 