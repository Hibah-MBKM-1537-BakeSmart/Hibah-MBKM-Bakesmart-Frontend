"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
// Note: Stock is now managed via item.stock property directly
import type { CartItem } from "@/lib/types";

export // Using CartItem from @/lib/types

interface CartContextType {
  cartItems: CartItem[];
  selectedOrderDay: string | null; // Hari yang dipilih untuk pesanan
  setSelectedOrderDay: (day: string | null) => void;
  weekStartDate: string | null;
  weekEndDate: string | null;
  setWeekDateRange: (startDate: string | null, endDate: string | null) => void;
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

interface CartStorage {
  items: CartItem[];
  orderDay: string | null;
  weekStartDate: string | null;
  weekEndDate: string | null;
  timestamp: number;
}

const CART_STORAGE_KEY = "merpati-bakery-cart";
const CART_EXPIRY_HOURS = 24;

const isCartExpired = (timestamp: number): boolean => {
  const expiryMs = CART_EXPIRY_HOURS * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryMs;
};

const loadCartFromStorage = (): CartStorage | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;

    const cartData: CartStorage = JSON.parse(stored);

    // Check if cart has expired (24 hours)
    if (isCartExpired(cartData.timestamp)) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }

    return cartData;
  } catch (error) {
    console.error("[v0] Error loading cart from storage:", error);
    return null;
  }
};

const saveCartToStorage = (
  items: CartItem[],
  orderDay: string | null,
  weekStartDate: string | null,
  weekEndDate: string | null
): void => {
  if (typeof window === "undefined") return;

  try {
    const cartData: CartStorage = {
      items,
      orderDay,
      weekStartDate,
      weekEndDate,
      timestamp: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error("[v0] Error saving cart to storage:", error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedOrderDay, setSelectedOrderDayState] = useState<string | null>(
    null
  );
  const [weekStartDate, setWeekStartDateState] = useState<string | null>(null);
  const [weekEndDate, setWeekEndDateState] = useState<string | null>(null);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  // Generate unique cart ID
  const generateCartId = () => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart) {
      console.log("[v0] Loading cart from storage:", savedCart);
      setCartItems(savedCart.items);
      if (savedCart.orderDay) {
        setSelectedOrderDayState(savedCart.orderDay);
      }
      if (savedCart.weekStartDate) {
        setWeekStartDateState(savedCart.weekStartDate);
      }
      if (savedCart.weekEndDate) {
        setWeekEndDateState(savedCart.weekEndDate);
      }
    }
  }, []);

  useEffect(() => {
    saveCartToStorage(cartItems, selectedOrderDay, weekStartDate, weekEndDate);
  }, [cartItems, selectedOrderDay, weekStartDate, weekEndDate]);

  const setSelectedOrderDay = (day: string | null) => {
    console.log("[v0] CartContext - Setting selectedOrderDay:", day);
    setSelectedOrderDayState(day);
  };

  const setWeekDateRange = (
    startDate: string | null,
    endDate: string | null
  ) => {
    console.log(
      "[v0] CartContext - Setting week date range:",
      startDate,
      "to",
      endDate
    );
    setWeekStartDateState(startDate);
    setWeekEndDateState(endDate);
  };

  const getCartItemKey = (item: Omit<CartItem, "quantity" | "cartId">) => {
    const attributesKey =
      item.selectedAttributes
        ?.map((attr) => `${attr.id}-${attr.harga}`)
        .sort()
        .join(",") || "no-attributes";
    // Include orderDay in the key to allow same product with same customization on different days
    const orderDay =
      item.orderDay || selectedOrderDay || item.availableDays?.[0] || "Senin";
    return `${item.id}-${attributesKey}-${orderDay}`;
  };

  const canAddToCart = (item: Omit<CartItem, "quantity" | "cartId">) => {
    const currentStock = item.stock || 0;
    if (currentStock <= 0) {
      return { canAdd: false, reason: "Stok habis" };
    }

    if (cartItems.length > 0) {
      // Use the selectedOrderDay if available, otherwise use the day from first cart item
      const cartDay = selectedOrderDay || cartItems[0].orderDay;
      // Check if item is available on the same day as cart items
      console.log("Available days:", item.availableDays);
      console.log("Cart day:", cartDay);
      if (!item.availableDays || !item.availableDays.includes(cartDay)) {
        return {
          canAdd: false,
          reason: `Pesanan Anda untuk hari ${cartDay}. Produk ini tidak tersedia untuk hari tersebut.`,
        };
      }
    }

    if (
      selectedOrderDay &&
      cartItems.length === 0 &&
      (!item.availableDays || !item.availableDays.includes(selectedOrderDay))
    ) {
      console.log("Available days:", item.availableDays);
      console.log("Selected day:", selectedOrderDay);
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
      // Use first available day from product and lock it
      const firstAvailableDay = item.availableDays?.[0] || "Senin";
      console.log(
        "[v0] First product added - auto-locking to day:",
        firstAvailableDay
      );
      setSelectedOrderDay(firstAvailableDay);
    }

    setCartItems((prev) => {
      const lockedDay =
        cartItems.length === 0
          ? item.availableDays?.[0] || "Senin"
          : selectedOrderDay || item.availableDays?.[0] || "Senin";
      const itemKey = getCartItemKey(item);

      // Look for existing item with EXACTLY same customization AND same order day
      const existingItem = prev.find((cartItem) => {
        const cartItemKey = getCartItemKey(cartItem);
        const sameCustomization = item.selectedAttributes?.every((attr) =>
          cartItem.selectedAttributes?.some(
            (cartAttr) =>
              cartAttr.id === attr.id && cartAttr.harga === attr.harga
          )
        );
        return (
          cartItemKey === itemKey &&
          cartItem.orderDay === lockedDay &&
          sameCustomization
        );
      });

      if (existingItem) {
        // Cek stok sebelum menambah quantity
        const totalQuantityForProduct = prev
          .filter(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.orderDay === lockedDay &&
              cartItem.cartId !== existingItem.cartId
          )
          .reduce((total, cartItem) => total + cartItem.quantity, 0);

        const newQuantity = existingItem.quantity + 1;
        const currentStock = existingItem.stock || 0;

        if (totalQuantityForProduct + newQuantity > currentStock) {
          alert(
            `Stok tidak mencukupi. Tersisa ${
              currentStock - totalQuantityForProduct
            } item`
          );
          return prev;
        }

        return prev.map((cartItem) =>
          cartItem.cartId === existingItem.cartId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }

      const attributesPrice =
        item.selectedAttributes?.reduce(
          (total, attr) => total + attr.harga,
          0
        ) || 0;

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          orderDay: lockedDay,
          attributesPrice,
          cartId: generateCartId(),
        },
      ];
    });

    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 600);
    return true;
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

    const currentStock = targetItem.stock || 0;

    // Filter semua item yang sama (termasuk variasi berbeda) untuk cek stok
    const totalQuantityForProduct = cartItems
      .filter(
        (cartItem) =>
          cartItem.id === targetItem.id &&
          cartItem.orderDay === targetItem.orderDay &&
          cartItem.cartId !== cartId // Exclude the current item being updated
      )
      .reduce((total, cartItem) => total + cartItem.quantity, 0);

    // Tambahkan quantity yang baru ke total
    const newTotalQuantity = totalQuantityForProduct + quantity;

    if (newTotalQuantity > currentStock) {
      alert(
        `Stok tidak mencukupi. Tersisa ${
          currentStock - totalQuantityForProduct
        } item`
      );
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
    setWeekDateRange(null, null);
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
      const basePrice = item.originalPrice
        ? Number.parseInt(item.originalPrice.replace(/\D/g, ""))
        : Number.parseInt(item.discountPrice.replace(/\D/g, ""));
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
      (item) =>
        item.availableDays &&
        item.availableDays.some(
          (day) => day.toLowerCase() === selectedOrderDay.toLowerCase()
        ) &&
        item.stock > 0
    );
  };

  const getInvalidItems = () => {
    if (!selectedOrderDay) return [];
    return cartItems.filter(
      (item) =>
        !item.availableDays ||
        !item.availableDays.some(
          (day) => day.toLowerCase() === selectedOrderDay.toLowerCase()
        ) ||
        item.stock <= 0
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
  // Note: Stock management is now handled by the backend
  const completeOrder = () => {
    // Clear cart after order is processed by backend
    clearCart();
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

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedOrderDay,
        setSelectedOrderDay,
        weekStartDate,
        weekEndDate,
        setWeekDateRange,
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
