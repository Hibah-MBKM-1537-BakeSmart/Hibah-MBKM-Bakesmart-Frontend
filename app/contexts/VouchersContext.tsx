"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Backend API URL
const BACKEND_API_URL = "http://localhost:5000/voucher";

export interface Voucher {
  id: string;
  nama: string; // Backend menggunakan 'nama' bukan 'code'
  code: string; // Untuk kompatibilitas frontend, kita map dari 'kode'
  kode: string; // Field asli dari backend
  discount: number; // Untuk kompatibilitas, map dari 'persen'
  persen: number; // Field asli dari backend
  discountType: "percentage" | "fixed";
  expiryDate: string;
  usageCount: number;
  maxUsage: number | null;
  status: "active" | "inactive" | "expired";
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

interface VouchersContextType {
  vouchers: Voucher[];
  loading: boolean;
  error: string | null;
  refreshVouchers: () => Promise<void>;
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

export function VouchersProvider({ children }: { children: ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping function dari backend response ke frontend format
  const mapBackendToFrontend = (backendVoucher: any): Voucher => {
    const today = new Date();
    const expiryDate = backendVoucher.expiryDate ? new Date(backendVoucher.expiryDate) : new Date();
    const status: "active" | "inactive" | "expired" = expiryDate < today ? "expired" : "active";

    return {
      id: backendVoucher.id?.toString() || "",
      nama: backendVoucher.nama || "",
      code: backendVoucher.kode || backendVoucher.code || "",
      kode: backendVoucher.kode || backendVoucher.code || "",
      discount: backendVoucher.persen || backendVoucher.discount || 0,
      persen: backendVoucher.persen || backendVoucher.discount || 0,
      discountType: "percentage", // Backend hanya support percentage
      expiryDate: backendVoucher.expiryDate || new Date().toISOString().split("T")[0],
      usageCount: backendVoucher.usageCount || 0,
      maxUsage: backendVoucher.maxUsage || null,
      status: backendVoucher.status || status,
      createdAt: backendVoucher.created_at || backendVoucher.createdAt || new Date().toISOString().split("T")[0],
      created_at: backendVoucher.created_at,
      updated_at: backendVoucher.updated_at,
    };
  };

  // Fetch vouchers dari backend
  const refreshVouchers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(BACKEND_API_URL, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Debug: Log response untuk troubleshooting
      console.log("[VouchersContext] Backend response:", result);

      // Handle different response formats
      let vouchersData: any[] = [];
      
      // Format 1: { message: "...", data: [...] } - Backend actual format
      if (result.data && Array.isArray(result.data)) {
        vouchersData = result.data;
      }
      // Format 2: { status: "success", data: { data: [...] } } - Documented format
      else if (result.status === "success" && result.data && result.data.data) {
        vouchersData = result.data.data;
      }
      // Format 3: { status: "success", data: [...] }
      else if (result.status === "success" && Array.isArray(result.data)) {
        vouchersData = result.data;
      }
      // Format 4: Direct array [...]
      else if (Array.isArray(result)) {
        vouchersData = result;
      }
      else {
        console.error("[VouchersContext] Unexpected response format:", result);
        throw new Error(`Format response tidak sesuai. Expected array of vouchers, got: ${JSON.stringify(result).substring(0, 100)}`);
      }

      const mappedVouchers = vouchersData.map(mapBackendToFrontend);
      console.log("[VouchersContext] Mapped vouchers:", mappedVouchers.length, "items");
      setVouchers(mappedVouchers);
      
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      
      let errorMessage = "Failed to fetch vouchers";
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Backend server tidak dapat diakses. Pastikan server backend running di http://localhost:5000";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setVouchers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load vouchers on mount
  useEffect(() => {
    refreshVouchers();
  }, []);

  const addVoucher = async (
    newVoucher: Omit<Voucher, "id" | "createdAt" | "usageCount" | "status">
  ) => {
    try {
      // Backend expects: { nama, persen, kode }
      const payload = {
        nama: newVoucher.nama || `Voucher ${newVoucher.code}`,
        persen: newVoucher.discount || newVoucher.persen,
        kode: newVoucher.code || newVoucher.kode,
      };

      console.log("[VouchersContext] Creating voucher with payload:", payload);

      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("[VouchersContext] Create response:", result);

      // Success if response is OK (even without status field)
      if (response.status === 200 || response.status === 201 || result.status === "success" || result.message?.includes("created")) {
        // Refresh vouchers list
        await refreshVouchers();
      } else {
        throw new Error(result.message || "Failed to create voucher");
      }
    } catch (err) {
      console.error("Error adding voucher:", err);
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new Error("Backend server tidak dapat diakses");
      }
      
      throw err;
    }
  };

  const updateVoucher = async (id: string, updates: Partial<Voucher>) => {
    try {
      // Backend expects: { nama?, persen?, kode? }
      const payload: any = {};
      if (updates.nama) payload.nama = updates.nama;
      if (updates.code || updates.kode) payload.kode = updates.code || updates.kode;
      if (updates.discount !== undefined || updates.persen !== undefined) {
        payload.persen = updates.discount !== undefined ? updates.discount : updates.persen;
      }

      console.log("[VouchersContext] Updating voucher:", id, "with payload:", payload);

      const response = await fetch(`${BACKEND_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("[VouchersContext] Update response:", result);

      // Success if response is OK
      if (response.status === 200 || result.status === "success" || result.message?.includes("updated")) {
        // Refresh vouchers list
        await refreshVouchers();
      } else {
        throw new Error(result.message || "Failed to update voucher");
      }
    } catch (err) {
      console.error("Error updating voucher:", err);
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new Error("Backend server tidak dapat diakses");
      }
      
      throw err;
    }
  };

  const deleteVoucher = async (id: string) => {
    try {
      console.log("[VouchersContext] Deleting voucher:", id);

      const response = await fetch(`${BACKEND_API_URL}/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("[VouchersContext] Delete response:", result);

      // Success if response is OK
      if (response.status === 200 || result.status === "success" || result.message?.includes("deleted")) {
        // Refresh vouchers list
        await refreshVouchers();
      } else {
        throw new Error(result.message || "Failed to delete voucher");
      }
    } catch (err) {
      console.error("Error deleting voucher:", err);
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new Error("Backend server tidak dapat diakses");
      }
      
      throw err;
    }
  };

  const incrementUsage = async (id: string) => {
    // This would need backend support
    // For now, just update locally
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
        loading,
        error,
        refreshVouchers,
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
