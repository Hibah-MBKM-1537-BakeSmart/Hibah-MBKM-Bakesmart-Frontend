"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  expiryDate: string;
  usageCount: number;
  maxUsage: number | null;
  status: "active" | "inactive" | "expired";
  createdAt: string;
}

interface VouchersContextType {
  vouchers: Voucher[];
  addVoucher: (
    voucher: Omit<Voucher, "id" | "createdAt" | "usageCount" | "status">
  ) => Promise<void>;
  updateVoucher: (id: string, updates: Partial<Voucher>) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
}

const VouchersContext = createContext<VouchersContextType | undefined>(
  undefined
);

// Mock initial data
const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: "1",
    code: "WELCOME20",
    discount: 20,
    discountType: "percentage",
    expiryDate: "2025-12-31",
    usageCount: 45,
    maxUsage: 100,
    status: "active",
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    code: "SAVE50000",
    discount: 50000,
    discountType: "fixed",
    expiryDate: "2025-11-30",
    usageCount: 12,
    maxUsage: 50,
    status: "active",
    createdAt: "2025-01-15",
  },
];

export function VouchersProvider({ children }: { children: ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  const addVoucher = async (
    newVoucher: Omit<Voucher, "id" | "createdAt" | "usageCount" | "status">
  ) => {
    const today = new Date();
    const expiryDate = new Date(newVoucher.expiryDate);
    const status: "active" | "inactive" | "expired" =
      expiryDate < today ? "expired" : "active";

    const voucher: Voucher = {
      ...newVoucher,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      usageCount: 0,
      status,
    };

    setVouchers([...vouchers, voucher]);
  };

  const updateVoucher = async (id: string, updates: Partial<Voucher>) => {
    setVouchers(vouchers.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVoucher = async (id: string) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
  };

  const incrementUsage = async (id: string) => {
    setVouchers(
      vouchers.map((v) =>
        v.id === id ? { ...v, usageCount: v.usageCount + 1 } : v
      )
    );
  };

  return (
    <VouchersContext.Provider
      value={{
        vouchers,
        addVoucher,
        updateVoucher,
        deleteVoucher,
        incrementUsage,
      }}
    >
      {children}
    </VouchersContext.Provider>
  );
}

export function useVouchers() {
  const context = useContext(VouchersContext);
  if (!context) {
    throw new Error("useVouchers must be used within a VouchersProvider");
  }
  return context;
}
