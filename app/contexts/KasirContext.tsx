'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

// Related entities interfaces based on backend structure
export interface Gambar {
  id: number;
  file_path: string;
  product_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface RefJenis {
  id: number;
  nama_id: string;
  nama_en: string;
}

export interface RefHari {
  id: number;
  nama_id: string;
  nama_en: string;
}

export interface RefAttribute {
  id: number;
  nama_id: string;
  nama_en: string;
  harga?: number;
}

export interface RefBahan {
  id: number;
  nama_id: string;
  nama_en: string;
  jumlah?: number;
}

export interface Product {
  id: number;
  nama_id: string;
  nama_en: string;
  deskripsi_id: string;
  deskripsi_en: string;
  harga: number;
  harga_diskon?: number;
  stok: number;
  isBestSeller?: boolean;
  isDaily?: boolean;
  daily_stock?: number;
  created_at?: string;
  updated_at?: string;
  // Related data (populated via joins)
  gambars?: Gambar[];
  jenis?: RefJenis[];
  hari?: RefHari[];
  attributes?: RefAttribute[];
  bahans?: RefBahan[];
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
  voucherCode: string;
  voucherDiscount: number;
  voucherId: number | null;
  voucherMinPurchase: number;
  orderDate: string;
  orderDay: string;
  deliveryMode: string;
  deliveryFee: number;
  catatan: string;
  isLoadingProducts: boolean;
  isApiConnected: boolean;
  isLoading: boolean;
}

interface KasirContextType {
  state: KasirState;
  addToCart: (product: Product, quantity?: number, note?: string, customizations?: Array<{ id: number; nama: string; harga_tambahan: number }>, finalPrice?: number) => void;
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
  setVoucherCode: (code: string) => void;
  setVoucherDiscount: (discount: number) => void;
  setVoucherId: (id: number | null) => void;
  setVoucherMinPurchase: (minPurchase: number) => void;
  setOrderDate: (date: string) => void;
  setOrderDay: (day: string) => void;
  setDeliveryMode: (mode: string) => void;
  setDeliveryFee: (fee: number) => void;
  setCatatan: (catatan: string) => void;
  processPayment: () => Promise<boolean>;
  calculateSubtotal: () => number;
  calculateTotal: () => number;
}

const KasirContext = createContext<KasirContextType | undefined>(undefined);

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
    voucherCode: '',
    voucherDiscount: 0,
    voucherId: null,
    voucherMinPurchase: 0,
    orderDate: '',
    orderDay: '',
    deliveryMode: '',
    deliveryFee: 0,
    catatan: '',
    isLoadingProducts: true,
    isApiConnected: false,
    isLoading: false
  });

  // Load products from backend API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('[Kasir] Loading products from backend...');
        setState(prev => ({ ...prev, isLoadingProducts: true, isApiConnected: false }));

        // Fetch products from backend via Next.js API proxy
        const response = await fetchWithAuth('/api/products', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const result = await response.json();
        console.log('[Kasir] Backend response:', result);

        // Backend response structure: { message: "...", data: [...] }
        const productsData = result?.data || [];
        console.log(`[Kasir] Received ${productsData.length} products from backend`);

        // Filter products that are daily items (isDaily=true) with available daily_stock
        const availableProducts = productsData.filter((p: Product) => 
          p.isDaily === true && p.daily_stock != null && p.daily_stock > 0
        );
        console.log(`[Kasir] ${availableProducts.length} daily products with stock available`);

        // Map daily_stock to stok field for compatibility with existing cart logic
        const mappedProducts = availableProducts.map((p: Product) => ({
          ...p,
          stok: p.daily_stock || 0
        }));

        // Extract unique categories from products' jenis field
        const uniqueCategories = new Map<number, RefJenis>();
        mappedProducts.forEach((product: Product) => {
          if (product.jenis && Array.isArray(product.jenis)) {
            product.jenis.forEach((jenis: RefJenis) => {
              if (jenis && jenis.id) {
                uniqueCategories.set(jenis.id, jenis);
              }
            });
          }
        });
        const categories = Array.from(uniqueCategories.values());
        console.log(`[Kasir] Extracted ${categories.length} categories:`, categories);

        setState(prev => ({
          ...prev,
          products: mappedProducts,
          categories: categories,
          isLoadingProducts: false,
          isApiConnected: true
        }));

        console.log('[Kasir] Products loaded successfully');
      } catch (error) {
        console.error('[Kasir] Failed to load products:', error);
        setState(prev => ({
          ...prev,
          products: [],
          categories: [],
          isLoadingProducts: false,
          isApiConnected: false
        }));
      }
    };

    loadProducts();
  }, []);

  // Auto-sync: Poll backend API every 10 seconds to sync with product changes
  useEffect(() => {
    if (!state.isApiConnected) return;

    const syncInterval = setInterval(async () => {
      try {
        const response = await fetchWithAuth('/api/products', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Sync failed');
        }

        const result = await response.json();
        const productsData = result?.data || [];
        const availableProducts = productsData.filter((p: Product) => 
          p.isDaily === true && p.daily_stock != null && p.daily_stock > 0
        );
        const mappedProducts = availableProducts.map((p: Product) => ({
          ...p,
          stok: p.daily_stock || 0
        }));

        setState(prev => {
          // Only update if data has changed
          const hasChanges = JSON.stringify(prev.products) !== JSON.stringify(mappedProducts);
          if (hasChanges) {
            console.log('[Kasir] Products synced from backend');
            return { ...prev, products: mappedProducts };
          }
          return prev;
        });
      } catch (error) {
        console.warn('[Kasir] Auto-sync failed:', error);
        setState(prev => ({ ...prev, isApiConnected: false }));
      }
    }, 10000); // Sync every 10 seconds

    return () => clearInterval(syncInterval);
  }, [state.isApiConnected]);

  const addToCart = (product: Product, quantity: number = 1, note?: string, customizations?: Array<{ id: number; nama: string; harga_tambahan: number }>, finalPrice?: number) => {
    setState(prev => {
      // Check stock availability
      const currentCartQuantity = prev.cart
        .filter(item => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      const totalQuantity = currentCartQuantity + quantity;

      if (totalQuantity > product.stok) {
        console.warn(`Insufficient stock for ${product.nama_id}. Available: ${product.stok}, Requested: ${totalQuantity}`);
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
  }; const clearCart = () => {
    setState(prev => ({
      ...prev,
      cart: [],
      customerName: '',
      customerWhatsApp: '',
      customerAddress: '',
      voucherCode: '',
      voucherDiscount: 0,
      voucherId: null,
      voucherMinPurchase: 0,
      catatan: ''
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

  const setVoucherCode = (code: string) => {
    setState(prev => ({ ...prev, voucherCode: code }));
  };

  const setVoucherDiscount = (discount: number) => {
    setState(prev => ({ ...prev, voucherDiscount: discount }));
  };

  const setVoucherId = (id: number | null) => {
    setState(prev => ({ ...prev, voucherId: id }));
  };

  const setVoucherMinPurchase = (minPurchase: number) => {
    setState(prev => ({ ...prev, voucherMinPurchase: minPurchase }));
  };

  const setOrderDate = (date: string) => {
    setState(prev => ({ ...prev, orderDate: date }));
  };

  const setOrderDay = (day: string) => {
    setState(prev => ({ ...prev, orderDay: day }));
  };

  const setDeliveryMode = (mode: string) => {
    setState(prev => ({ ...prev, deliveryMode: mode }));
  };

  const setDeliveryFee = (fee: number) => {
    setState(prev => ({ ...prev, deliveryFee: fee }));
  };

  const setCatatan = (catatan: string) => {
    setState(prev => ({ ...prev, catatan: catatan }));
  };

  const calculateSubtotal = () => {
    return state.cart.reduce((total, item) => {
      const itemPrice = item.finalPrice || item.product.harga;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const finalDeliveryFee = state.deliveryMode === 'pickup' ? 0 : state.deliveryFee;
    const total = subtotal + finalDeliveryFee - state.voucherDiscount;
    return Math.max(0, total); // Pastikan total tidak negatif
  };

  const processPayment = async (): Promise<boolean> => {
    try {
      // Validate cart
      if (state.cart.length === 0) {
        alert('Keranjang kosong! Tambahkan produk terlebih dahulu.');
        return false;
      }

      // Validate customer info (optional for kasir)
      if (!state.customerName.trim()) {
        alert('Nama pelanggan harus diisi!');
        return false;
      }

      console.log('[Kasir] Processing payment...');
      setState(prev => ({ ...prev, isLoading: true }));

      // Create order via backend API
      if (state.isApiConnected) {
        try {
          // Format waktu_ambil - use orderDate if set, otherwise use today
          let waktuAmbil = state.orderDate;
          if (!waktuAmbil) {
            waktuAmbil = new Date().toISOString().split('T')[0];
          }

          // Prepare order data for kasir endpoint
          // Note: POST /orders/kasir is a simplified endpoint that:
          // - Does NOT require shipping coordinates or courier data
          // - Does NOT register with external logistics providers
          // - Automatically sets Production Status to "completed"
          // - Automatically sets Order Status to "paid"
          // - Still handles auto-user creation based on phone number
          const orderData = {
            // Customer info (for auto-user creation based on phone)
            customerName: state.customerName,
            customerPhone: state.customerWhatsApp,

            // Cart items with pricing
            items: state.cart.map(item => ({
              product_id: item.product.id,
              jumlah: item.quantity,
              harga_beli: item.finalPrice || item.product.harga,
              note: item.note || null
            })),

            // Pricing
            total_harga: calculateTotal(),

            // Payment provider
            provider_pembayaran: state.paymentMethod,
            
            // Timing
            waktu_ambil: waktuAmbil,

            // Optional fields
            catatan: state.catatan || '',
            voucher_id: state.voucherId, // Voucher ID from validation
          };

          console.log('[Kasir] Sending order to backend:', orderData);

          const response = await fetchWithAuth('/api/orders/kasir', {
            method: 'POST',
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create order: ${response.status}`);
          }

          const result = await response.json();
          console.log('[Kasir] Order created successfully:', result);

          // Create local transaction record
          const transaction: Transaction = {
            id: result.data?.id?.toString() || `TXN${Date.now()}`,
            items: [...state.cart],
            subtotal: calculateSubtotal(),
            tax: 0, // No tax in new kasir
            discount: state.voucherDiscount,
            total: calculateTotal(),
            paymentMethod: state.paymentMethod,
            customerName: state.customerName,
            timestamp: new Date(),
            status: 'completed'
          };

          setState(prev => ({
            ...prev,
            currentTransaction: transaction,
            isLoading: false
          }));

          // Clear cart after successful order
          clearCart();

          alert('✅ Pembayaran berhasil! Order telah dibuat.');
          return true;

        } catch (error) {
          console.error('[Kasir] Failed to create order in backend:', error);
          setState(prev => ({ ...prev, isLoading: false }));
          alert(`❌ Gagal membuat order: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return false;
        }
      } else {
        // API not connected
        setState(prev => ({ ...prev, isLoading: false }));
        alert('❌ Tidak dapat terhubung ke server. Silakan coba lagi.');
        return false;
      }
    } catch (error) {
      console.error('[Kasir] Payment processing failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert(`❌ Pembayaran gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setVoucherCode,
    setVoucherDiscount,
    setVoucherId,
    setVoucherMinPurchase,
    setOrderDate,
    setOrderDay,
    setDeliveryMode,
    setDeliveryFee,
    setCatatan,
    processPayment,
    calculateSubtotal,
    calculateTotal
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
