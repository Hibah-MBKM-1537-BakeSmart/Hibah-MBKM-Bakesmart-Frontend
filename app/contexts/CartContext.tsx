"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { stockManager } from "@/lib/api/stockManager";

interface CartItem {
  id: number;
  name: string;
  discountPrice: string;
  originalPrice?: string;
  isDiscount?: boolean;
  image: string;
  quantity: number;
  category: string;
  orderDay: string; // Hari pesanan (senin, selasa, etc.)
  availableDays: string[];
  stock: number; // Stock tersedia untuk hari tersebut
  selectedAttributes?: {
    id: number;
    name: string;
    additionalPrice: number;
  }[];
  attributesPrice?: number;
  cartId: string; // Add unique cartId for each cart item
}

interface CartContextType {
  cartItems: CartItem[];
  selectedOrderDay: string | null; // Hari yang dipilih untuk pesanan
  setSelectedOrderDay: (day: string | null) => void;
  addToCart: (item: Omit<CartItem, "quantity" | "cartId">) => boolean; // Return false jika gagal
  removeFromCart: (cartId: string) => void; // Use cartId instead of id + attributes
  updateQuantity: (cartId: string, quantity: number) => boolean; // Use cartId instead of id + attributes
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalOriginalPrice: () => number;
  getTotalSavings: () => number;
  showCartAnimation: boolean;
  setShowCartAnimation: (show: boolean) => void;
  canAddToCart: (item: Omit<CartItem, "quantity" | "cartId">) => {
    canAdd: boolean;
    reason?: string;
  };
  validateCartDay: () => boolean; // Validasi semua item di cart untuk hari yang sama
  getValidItems: () => CartItem[];
  getInvalidItems: () => CartItem[];
  canCompleteOrder: () => boolean;
  isCartLockedToDay: () => boolean; // Check if cart is locked to a specific day
  completeOrder: () => boolean; // Function to complete order and decrease stock
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedOrderDay, setSelectedOrderDayState] = useState<string | null>(
    null
  );
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  // Generate unique cart ID
  const generateCartId = () => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load from memory storage instead of localStorage for artifact compatibility
  useEffect(() => {
    // In a real app, you would use localStorage here
    // const savedCart = localStorage.getItem("merpati-bakery-cart");
    // const savedOrderDay = localStorage.getItem("merpati-bakery-order-day");
    // For now, we'll use memory storage only
  }, []);

  // Save to memory storage instead of localStorage for artifact compatibility
  useEffect(() => {
    // In a real app, you would use localStorage here
    // localStorage.setItem("merpati-bakery-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // In a real app, you would use localStorage here
    // if (selectedOrderDay) {
    //   localStorage.setItem("merpati-bakery-order-day", selectedOrderDay);
    // } else {
    //   localStorage.removeItem("merpati-bakery-order-day");
    // }
  }, [selectedOrderDay]);

  const setSelectedOrderDay = (day: string | null) => {
    console.log("[v0] CartContext - Setting selectedOrderDay:", day);
    setSelectedOrderDayState(day);
  };

  // Helper function to create unique cart item identifier
  // FIXED: Remove orderDay from key to allow proper matching of same customizations
  const getCartItemKey = (item: Omit<CartItem, "quantity" | "cartId">) => {
    const attributesKey =
      item.selectedAttributes
        ?.map((attr) => `${attr.id}-${attr.additionalPrice}`)
        .sort()
        .join(",") || "no-attributes";
    return `${item.id}-${attributesKey}`; // Removed orderDay from key
  };

  const canAddToCart = (item: Omit<CartItem, "quantity" | "cartId">) => {
    const currentStock = stockManager.getStock(item.id);
    if (currentStock <= 0) {
      return { canAdd: false, reason: "Stok habis" };
    }

    if (cartItems.length > 0) {
      // Use the selectedOrderDay if available, otherwise use the day from first cart item
      const cartDay = selectedOrderDay || cartItems[0].orderDay;
      // Check if item is available on the same day as cart items
      if (!item.availableDays.includes(cartDay)) {
        return {
          canAdd: false,
          reason: `Pesanan Anda untuk hari ${cartDay}. Produk ini tidak tersedia untuk hari tersebut.`,
        };
      }
    }

    if (
      selectedOrderDay &&
      cartItems.length === 0 &&
      !item.availableDays.includes(selectedOrderDay)
    ) {
      return {
        canAdd: false,
        reason: `Produk tidak tersedia untuk hari ${selectedOrderDay}`,
      };
    }

    const totalQuantityForProduct = cartItems
      .filter((cartItem) => cartItem.id === item.id)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);

    if (totalQuantityForProduct >= currentStock) {
      return { canAdd: false, reason: "Stok tidak mencukupi" };
    }

    return { canAdd: true };
  };

  const addToCart = (item: Omit<CartItem, "quantity" | "cartId">) => {
    const validation = canAddToCart(item);
    if (!validation.canAdd) {
      console.log("[v0] Cannot add to cart:", validation.reason);
      alert(validation.reason);
      return false;
    }

    if (cartItems.length === 0) {
      // If we have a selectedOrderDay and item is available on that day, use it
      if (selectedOrderDay && item.availableDays.includes(selectedOrderDay)) {
        console.log("[v0] Using existing selectedOrderDay:", selectedOrderDay);
        // Keep the selectedOrderDay
      } else {
        // Otherwise, use the first available day for this item
        console.log(
          "[v0] Setting new selectedOrderDay:",
          item.availableDays[0]
        );
        setSelectedOrderDay(item.availableDays[0]);
      }
    }

    setCartItems((prev) => {
      const itemKey = getCartItemKey(item);
      const orderDay = selectedOrderDay || item.availableDays[0];

      // FIXED: Look for existing item with same customization AND same order day
      const existingItem = prev.find((cartItem) => {
        const cartItemKey = getCartItemKey(cartItem);
        return cartItemKey === itemKey && cartItem.orderDay === orderDay;
      });

      if (existingItem) {
        return prev.map((cartItem) => {
          const cartItemKey = getCartItemKey(cartItem);
          return cartItemKey === itemKey && cartItem.orderDay === orderDay
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem;
        });
      }

      const attributesPrice =
        item.selectedAttributes?.reduce(
          (total, attr) => total + attr.additionalPrice,
          0
        ) || 0;

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          orderDay,
          attributesPrice,
          cartId: generateCartId(),
        },
      ];
    });

    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 600);
    return true;
  };

  const removeFromCart = (cartId: string) => {
    console.log(
      "[DEBUG] CartContext: removeFromCart called with cartId:",
      cartId
    );
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item.cartId !== cartId);
      console.log("[DEBUG] CartContext: Items before removal:", prev.length);
      console.log("[DEBUG] CartContext: Items after removal:", newItems.length);

      if (newItems.length === 0) {
        setSelectedOrderDay(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    console.log(
      "[DEBUG] CartContext: updateQuantity called with cartId:",
      cartId,
      "quantity:",
      quantity
    );

    if (quantity <= 0) {
      removeFromCart(cartId);
      return true;
    }

    const targetItem = cartItems.find((item) => item.cartId === cartId);
    if (!targetItem) {
      console.log(
        "[DEBUG] CartContext: Target item not found for cartId:",
        cartId
      );
      return false;
    }

    const currentStock = stockManager.getStock(targetItem.id);
    const totalQuantityForProduct = cartItems
      .filter((cartItem) => cartItem.id === targetItem.id)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);

    const newTotalQuantity =
      totalQuantityForProduct - targetItem.quantity + quantity;

    if (newTotalQuantity > currentStock) {
      alert(`Stok tidak mencukupi. Maksimal ${currentStock} item`);
      return false;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
    console.log("[DEBUG] CartContext: Quantity updated successfully");
    return true;
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedOrderDay(null);
  };

  const validateCartDay = () => {
    if (cartItems.length === 0) return true;

    const firstItemDay = cartItems[0].orderDay;
    return cartItems.every((item) => item.orderDay === firstItemDay);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = Number.parseInt(item.discountPrice.replace(/\D/g, ""));
      const attributesPrice = item.attributesPrice || 0;
      return total + (basePrice + attributesPrice) * item.quantity;
    }, 0);
  };

  const getTotalOriginalPrice = () => {
    return cartItems.reduce((total, item) => {
      const shouldUseOriginal = item.isDiscount && item.originalPrice;
      const priceToUse = shouldUseOriginal
        ? item.originalPrice!
        : item.discountPrice;
      const basePrice = Number.parseInt(priceToUse.replace(/\D/g, ""));
      const attributesPrice = item.attributesPrice || 0;
      return total + (basePrice + attributesPrice) * item.quantity;
    }, 0);
  };

  const getTotalSavings = () => {
    return getTotalOriginalPrice() - getTotalPrice();
  };

  const getValidItems = () => {
    if (!selectedOrderDay) return cartItems;
    return cartItems.filter(
      (item) => item.availableDays.includes(selectedOrderDay) && item.stock > 0
    );
  };

  const getInvalidItems = () => {
    if (!selectedOrderDay) return [];
    return cartItems.filter(
      (item) =>
        !item.availableDays.includes(selectedOrderDay) || item.stock <= 0
    );
  };

  const canCompleteOrder = () => {
    return (
      selectedOrderDay !== null &&
      getValidItems().length > 0 &&
      getInvalidItems().length === 0
    );
  };

  const isCartLockedToDay = () => {
    return cartItems.length > 0;
  };

  // Function to complete order and decrease stock
  const completeOrder = () => {
    const validItems = getValidItems();

    // Decrease stock untuk setiap item
    for (const item of validItems) {
      const success = stockManager.decreaseStock(item.id, item.quantity);
      if (!success) {
        alert(`Gagal memproses pesanan. Stok ${item.name} tidak mencukupi.`);
        return false;
      }
    }

    // Clear cart setelah order berhasil
    clearCart();
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedOrderDay,
        setSelectedOrderDay,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getTotalOriginalPrice,
        getTotalSavings,
        showCartAnimation,
        setShowCartAnimation,
        canAddToCart,
        validateCartDay,
        getValidItems,
        getInvalidItems,
        canCompleteOrder,
        isCartLockedToDay,
        completeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
