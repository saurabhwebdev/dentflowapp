import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  supplier: string;
  supplierContact: string;
  location: string;
  expiryDate?: string;
  lastRestock: string;
  notes: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Get all inventory items for a user
export async function getInventoryItems(user: User): Promise<InventoryItem[]> {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef,
      where('createdBy', '==', user.uid),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    const inventoryItems: InventoryItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      inventoryItems.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        sku: data.sku,
        quantity: data.quantity,
        unit: data.unit,
        minQuantity: data.minQuantity,
        price: data.price,
        supplier: data.supplier,
        supplierContact: data.supplierContact,
        location: data.location,
        expiryDate: data.expiryDate,
        lastRestock: data.lastRestock,
        notes: data.notes,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    
    return inventoryItems;
  } catch (error) {
    console.error("Error getting inventory items:", error);
    throw error;
  }
}

// Add a new inventory item
export async function addInventoryItem(
  user: User,
  item: Omit<InventoryItem, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const inventoryRef = collection(db, 'inventory');
    const docRef = await addDoc(inventoryRef, {
      ...item,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error;
  }
}

// Update an inventory item
export async function updateInventoryItem(
  user: User,
  itemId: string,
  updatedData: Partial<InventoryItem>
): Promise<void> {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Inventory item not found');
    }
    
    const itemData = itemDoc.data();
    if (itemData.createdBy !== user.uid) {
      throw new Error('Unauthorized to update this inventory item');
    }
    
    await updateDoc(itemRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
}

// Delete an inventory item
export async function deleteInventoryItem(
  user: User,
  itemId: string
): Promise<void> {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Inventory item not found');
    }
    
    const itemData = itemDoc.data();
    if (itemData.createdBy !== user.uid) {
      throw new Error('Unauthorized to delete this inventory item');
    }
    
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
}

// Generate SKU for inventory item
export async function generateSKU(user: User, category: string): Promise<string> {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef,
      where('createdBy', '==', user.uid),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    const itemCount = querySnapshot.size + 1;
    
    // Create SKU with category prefix + sequential number
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const sku = `${categoryPrefix}-${String(itemCount).padStart(4, '0')}`;
    
    return sku;
  } catch (error) {
    console.error("Error generating SKU:", error);
    throw error;
  }
}

// Update inventory quantity (for restocking or using items)
export async function updateInventoryQuantity(
  user: User,
  itemId: string,
  newQuantity: number,
  isRestock: boolean = false
): Promise<void> {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Inventory item not found');
    }
    
    const itemData = itemDoc.data();
    if (itemData.createdBy !== user.uid) {
      throw new Error('Unauthorized to update this inventory item');
    }
    
    const updateData: any = {
      quantity: newQuantity,
      updatedAt: serverTimestamp(),
    };
    
    // If this is a restock, update the lastRestock date
    if (isRestock) {
      updateData.lastRestock = new Date().toISOString().split('T')[0];
    }
    
    await updateDoc(itemRef, updateData);
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    throw error;
  }
}

// Get low stock items (below minimum quantity)
export async function getLowStockItems(user: User): Promise<InventoryItem[]> {
  try {
    const inventoryItems = await getInventoryItems(user);
    return inventoryItems.filter(item => item.quantity <= item.minQuantity);
  } catch (error) {
    console.error("Error getting low stock items:", error);
    throw error;
  }
}

// Get expiring items
export async function getExpiringItems(user: User, daysThreshold: number = 30): Promise<InventoryItem[]> {
  try {
    const inventoryItems = await getInventoryItems(user);
    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return inventoryItems.filter(item => {
      if (!item.expiryDate) return false;
      
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thresholdDate;
    });
  } catch (error) {
    console.error("Error getting expiring items:", error);
    throw error;
  }
} 