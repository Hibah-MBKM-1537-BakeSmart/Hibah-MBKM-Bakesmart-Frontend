'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsApi, categoriesApi, checkApiConnection } from '@/lib/api/mockApi';

// Related entities interfaces based on ERD
export interface Gambar {
  id: string;
  file_path: string;
  product_id: string;
}

export interface RefJenis {
  id: string;
  nama: string;
}

export interface RefHari {
  id: string;
  nama: string;
}

export interface RefAttribute {
  id: string;
  nama: string;
}

export interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  created_at?: string;
  updated_at?: string;
  // Related data (populated via joins)
  gambars?: Gambar[];
  jenis?: RefJenis[];
  hari?: RefHari[];
  attributes?: RefAttribute[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
  customizations?: Array<{
    id: number;
    nama: string;
    harga_tambahan: number;
  }>;
  finalPrice?: number; // Price per item including customizations
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'gopay' | 'ovo' | 'dana';
  customerName?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

interface KasirState {
  cart: CartItem[];
  currentTransaction: Transaction | null;
  products: Product[];
  categories: RefJenis[];
  selectedCategory: string;
  showCart: boolean;
  paymentMethod: 'cash' | 'transfer' | 'gopay' | 'ovo' | 'dana';
  customerName: string;
  customerWhatsApp: string;
  customerAddress: string;
  discount: number;
  discountType: 'percentage' | 'nominal';
  isLoadingProducts: boolean;
  isApiConnected: boolean;
}

interface KasirContextType {
  state: KasirState;
  addToCart: (product: Product, quantity?: number, note?: string, customizations?: Array<{id: number; nama: string; harga_tambahan: number}>, finalPrice?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  updateCartItemNote: (productId: number, note: string) => void;
  clearCart: () => void;
  setSelectedCategory: (category: string) => void;
  toggleCart: () => void;
  setPaymentMethod: (method: 'cash' | 'transfer' | 'gopay' | 'ovo' | 'dana') => void;
  setCustomerName: (name: string) => void;
  setCustomerWhatsApp: (whatsapp: string) => void;
  setCustomerAddress: (address: string) => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (type: 'percentage' | 'nominal') => void;
  processPayment: () => Promise<boolean>;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  calculateDiscountAmount: () => number;
}

const KasirContext = createContext<KasirContextType | undefined>(undefined);

// Sample products data
const sampleProducts: Product[] = [
  {
    id: 1,
    nama: 'Chocolate Cake',
    harga: 125000,
    deskripsi: 'Rich chocolate cake with cream frosting',
    stok: 10,
    gambars: [
      { id: '1', file_path: '/img/cake1.jpg', product_id: '1' }
    ],
    jenis: [
      { id: '1', nama: 'Cake' }
    ],
    hari: [
      { id: '1', nama: 'Monday' },
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' },
      { id: '6', nama: 'Saturday' },
      { id: '7', nama: 'Sunday' }
    ],
    attributes: [
      { id: '1', nama: 'Sweet' },
      { id: '2', nama: 'Premium' }
    ]
  },
  {
    id: 2,
    nama: 'Red Velvet Cupcakes',
    harga: 15000,
    deskripsi: 'Classic red velvet cupcakes (per piece)',
    stok: 24,
    gambars: [
      { id: '2', file_path: '/img/cupcake1.jpg', product_id: '2' }
    ],
    jenis: [
      { id: '2', nama: 'Cupcake' }
    ],
    hari: [
      { id: '1', nama: 'Monday' },
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' }
    ],
    attributes: [
      { id: '1', nama: 'Sweet' }
    ]
  },
  {
    id: 3,
    nama: 'Croissant',
    harga: 12000,
    deskripsi: 'Buttery French croissant',
    stok: 15,
    gambars: [
      { id: '3', file_path: '/img/croissant1.jpg', product_id: '3' }
    ],
    jenis: [
      { id: '3', nama: 'Pastry' }
    ],
    hari: [
      { id: '1', nama: 'Monday' },
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' },
      { id: '6', nama: 'Saturday' }
    ],
    attributes: [
      { id: '3', nama: 'Fresh' }
    ]
  },
  {
    id: 4,
    nama: 'Birthday Cake',
    harga: 200000,
    deskripsi: 'Custom birthday cake with decoration',
    stok: 5,
    gambars: [
      { id: '4', file_path: '/img/birthday1.jpg', product_id: '4' }
    ],
    jenis: [
      { id: '1', nama: 'Cake' }
    ],
    hari: [
      { id: '6', nama: 'Saturday' },
      { id: '7', nama: 'Sunday' }
    ],
    attributes: [
      { id: '2', nama: 'Premium' },
      { id: '4', nama: 'Custom' }
    ]
  },
  {
    id: 5,
    nama: 'Donuts Box (12 pcs)',
    harga: 60000,
    deskripsi: 'Mixed flavors donut box',
    stok: 8,
    gambars: [
      { id: '5', file_path: '/img/donuts1.jpg', product_id: '5' }
    ],
    jenis: [
      { id: '4', nama: 'Donut' }
    ],
    hari: [
      { id: '1', nama: 'Monday' },
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' },
      { id: '6', nama: 'Saturday' },
      { id: '7', nama: 'Sunday' }
    ],
    attributes: [
      { id: '1', nama: 'Sweet' },
      { id: '5', nama: 'Mixed' }
    ]
  },
  {
    id: 6,
    nama: 'Cheese Tart',
    harga: 25000,
    deskripsi: 'Creamy cheese tart',
    stok: 12,
    gambars: [
      { id: '6', file_path: '/img/tart1.jpg', product_id: '6' }
    ],
    jenis: [
      { id: '5', nama: 'Tart' }
    ],
    hari: [
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' },
      { id: '6', nama: 'Saturday' }
    ],
    attributes: [
      { id: '6', nama: 'Creamy' }
    ]
  },
  {
    id: 7,
    nama: 'Apple Pie',
    harga: 45000,
    deskripsi: 'Traditional apple pie',
    stok: 6,
    gambars: [
      { id: '7', file_path: '/img/pie1.jpg', product_id: '7' }
    ],
    jenis: [
      { id: '6', nama: 'Pie' }
    ],
    hari: [
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' },
      { id: '6', nama: 'Saturday' },
      { id: '7', nama: 'Sunday' }
    ],
    attributes: [
      { id: '7', nama: 'Traditional' }
    ]
  },
  {
    id: 8,
    nama: 'Bagel',
    harga: 18000,
    deskripsi: 'Fresh baked bagel',
    stok: 20,
    gambars: [
      { id: '8', file_path: '/img/bagel1.jpg', product_id: '8' }
    ],
    jenis: [
      { id: '7', nama: 'Bread' }
    ],
    hari: [
      { id: '1', nama: 'Monday' },
      { id: '2', nama: 'Tuesday' },
      { id: '3', nama: 'Wednesday' },
      { id: '4', nama: 'Thursday' },
      { id: '5', nama: 'Friday' }
    ],
    attributes: [
      { id: '3', nama: 'Fresh' }
    ]
  }
];

export function KasirProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<KasirState>({
    cart: [],
    currentTransaction: null,
    products: [],
    categories: [],
    selectedCategory: 'All',
    showCart: false,
    paymentMethod: 'cash',
    customerName: '',
    customerWhatsApp: '',
    customerAddress: '',
    discount: 0,
    discountType: 'nominal',
    isLoadingProducts: true,
    isApiConnected: false
  });

  // Load products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setState(prev => ({ ...prev, isLoadingProducts: true }));
        
        // Check API connection
        const isConnected = await checkApiConnection();
        setState(prev => ({ ...prev, isApiConnected: isConnected }));

        if (isConnected) {
          // Load from API
          const [products, categories] = await Promise.all([
            productsApi.getAll(),
            categoriesApi.getAll()
          ]);
          
          // Transform API data to match Product interface - only active products
          const transformedProducts: Product[] = products
            .filter((p: any) => p.status === 'active' && p.stok > 0) // Only show active products with stock
            .map((p: any) => ({
              id: p.id,
              nama: p.nama,
              harga: p.harga,
              deskripsi: p.deskripsi || '',
              stok: p.stok || 0,
              gambars: p.gambars || [],
              jenis: p.jenis || [],
              hari: p.hari || [],
              attributes: p.attributes || []
            }));

          setState(prev => ({
            ...prev,
            products: transformedProducts,
            categories: categories || [],
            isLoadingProducts: false
          }));
        } else {
          // Use sample products if API not available
          setState(prev => ({
            ...prev,
            products: sampleProducts,
            categories: [],
            isLoadingProducts: false
          }));
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to sample products on error
        setState(prev => ({
          ...prev,
          products: sampleProducts,
          categories: [],
          isLoadingProducts: false,
          isApiConnected: false
        }));
      }
    };

    loadProducts();
  }, []);

  // Auto-sync: Poll API every 5 seconds to sync with product changes
  useEffect(() => {
    if (!state.isApiConnected) return;

    const syncInterval = setInterval(async () => {
      try {
        const products = await productsApi.getAll();
        
        // Transform and filter products
        const transformedProducts: Product[] = products
          .filter((p: any) => p.status === 'active' && p.stok > 0)
          .map((p: any) => ({
            id: p.id,
            nama: p.nama,
            harga: p.harga,
            deskripsi: p.deskripsi || '',
            stok: p.stok || 0,
            gambars: p.gambars || [],
            jenis: p.jenis || [],
            hari: p.hari || [],
            attributes: p.attributes || []
          }));
        
        setState(prev => {
          // Only update if data has changed
          const hasChanges = JSON.stringify(prev.products) !== JSON.stringify(transformedProducts);
          if (hasChanges) {
            console.log('Kasir: Products synced from API');
            return { ...prev, products: transformedProducts };
          }
          return prev;
        });
      } catch (error) {
        console.warn('Kasir: Auto-sync failed:', error);
        setState(prev => ({ ...prev, isApiConnected: false }));
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [state.isApiConnected]);

  const addToCart = (product: Product, quantity: number = 1, note?: string, customizations?: Array<{id: number; nama: string; harga_tambahan: number}>, finalPrice?: number) => {
    setState(prev => {
      // Check stock availability
      const currentCartQuantity = prev.cart
        .filter(item => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      const totalQuantity = currentCartQuantity + quantity;
      
      if (totalQuantity > product.stok) {
        console.warn(`Insufficient stock for ${product.nama}. Available: ${product.stok}, Requested: ${totalQuantity}`);
        alert(`Stok tidak cukup! Tersedia: ${product.stok}, Di keranjang: ${currentCartQuantity}`);
        return prev; // Don't add to cart
      }

      // For customized products, always create a new cart item
      if (customizations && customizations.length > 0) {
        return {
          ...prev,
          cart: [...prev.cart, { 
            product, 
            quantity, 
            note,
            customizations,
            finalPrice 
          }]
        };
      }

      // For regular products, check if item exists and update quantity
      const existingItem = prev.cart.find(item => 
        item.product.id === product.id && 
        !item.customizations?.length
      );
      
      if (existingItem) {
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.product.id === product.id && !item.customizations?.length
              ? { ...item, quantity: item.quantity + quantity, note: note || item.note }
              : item
          )
        };
      }
      
      return {
        ...prev,
        cart: [...prev.cart, { product, quantity, note }]
      };
    });
  };

  const removeFromCart = (productId: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.product.id !== productId)
    }));
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setState(prev => {
      // Find the product to check stock
      const product = prev.products.find(p => p.id === productId);
      if (!product) return prev;

      // Check if requested quantity exceeds stock
      if (quantity > product.stok) {
        alert(`Stok tidak cukup! Maksimal: ${product.stok}`);
        return prev; // Don't update
      }

      return {
        ...prev,
        cart: prev.cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      };
    });
  };

  const updateCartItemNote = (productId: number, note: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.product.id === productId
          ? { ...item, note }
          : item
      )
    }));
  };  const clearCart = () => {
    setState(prev => ({
      ...prev,
      cart: [],
      customerName: '',
      customerWhatsApp: '',
      customerAddress: '',
      discount: 0,
      discountType: 'nominal'
    }));
  };

  const setSelectedCategory = (category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  };

  const toggleCart = () => {
    setState(prev => ({ ...prev, showCart: !prev.showCart }));
  };

  const setPaymentMethod = (method: 'cash' | 'transfer' | 'gopay' | 'ovo' | 'dana') => {
    setState(prev => ({ ...prev, paymentMethod: method }));
  };

  const setCustomerName = (name: string) => {
    setState(prev => ({ ...prev, customerName: name }));
  };

  const setCustomerWhatsApp = (whatsapp: string) => {
    setState(prev => ({ ...prev, customerWhatsApp: whatsapp }));
  };

  const setCustomerAddress = (address: string) => {
    setState(prev => ({ ...prev, customerAddress: address }));
  };

  const setDiscount = (discount: number) => {
    setState(prev => ({ ...prev, discount }));
  };

  const setDiscountType = (type: 'percentage' | 'nominal') => {
    setState(prev => ({ ...prev, discountType: type }));
  };

  const calculateSubtotal = () => {
    return state.cart.reduce((total, item) => {
      const itemPrice = item.finalPrice || item.product.harga;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = calculateDiscountAmount();
    const total = subtotal + tax - discountAmount;
    return Math.max(0, total); // Pastikan total tidak negatif
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    
    if (state.discountType === 'percentage') {
      // Diskon persentase dari subtotal + tax
      return (subtotal + tax) * (state.discount / 100);
    } else {
      // Diskon nominal
      return state.discount;
    }
  };

  const processPayment = async (): Promise<boolean> => {
    try {
      const transaction: Transaction = {
        id: `TXN${Date.now()}`,
        items: [...state.cart],
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        discount: state.discount,
        total: calculateTotal(),
        paymentMethod: state.paymentMethod,
        customerName: state.customerName,
        timestamp: new Date(),
        status: 'completed'
      };

      setState(prev => ({ ...prev, currentTransaction: transaction }));
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stock in API after successful payment
      if (state.isApiConnected) {
        try {
          for (const item of state.cart) {
            const newStok = item.product.stok - item.quantity;
            await productsApi.update(item.product.id, { 
              stok: newStok 
            });
            console.log(`Updated stock for ${item.product.nama}: ${item.product.stok} → ${newStok}`);
          }
        } catch (error) {
          console.error('Failed to update stock in API:', error);
          // Don't fail the transaction, just log the error
        }
      }
      
      // Clear cart after successful payment
      clearCart();
      
      return true;
    } catch (error) {
      console.error('Payment processing failed:', error);
      return false;
    }
  };

  const contextValue: KasirContextType = {
    state,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemNote,
    clearCart,
    setSelectedCategory,
    toggleCart,
    setPaymentMethod,
    setCustomerName,
    setCustomerWhatsApp,
    setCustomerAddress,
    setDiscount,
    setDiscountType,
    processPayment,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    calculateDiscountAmount
  };

  return (
    <KasirContext.Provider value={contextValue}>
      {children}
    </KasirContext.Provider>
  );
}

export function useKasir() {
  const context = useContext(KasirContext);
  if (context === undefined) {
    throw new Error('useKasir must be used within a KasirProvider');
  }
  return context;
}
