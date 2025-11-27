"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Use Next.js API route instead of direct backend call to avoid CORS
const BACKEND_API_URL = "/api/vouchers";

export interface Voucher {
  id: string;
  nama: string; // Backend menggunakan 'nama' bukan 'code'
  code: string; // Untuk kompatibilitas frontend, kita map dari 'kode'
  kode: string; // Field asli dari backend
  discount: number; // Untuk kompatibilitas, map dari 'persen'
  persen: number | string; // Field asli dari backend (bisa string atau number)
  discountType: "percentage" | "fixed";
  expiryDate: string;
  tanggal_mulai: string | null; // Field asli dari backend
  tanggal_selesai: string | null; // Field asli dari backend
  usageCount: number;
  maxUsage: number | null;
  batas_penggunaan: number; // Field asli dari backend
  status: "active" | "inactive" | "expired";
  qr_code?: string; // Field dari backend
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
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Use tanggal_selesai from backend, fallback to expiryDate
    const expiryDateStr = backendVoucher.tanggal_selesai || backendVoucher.expiryDate;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
    if (expiryDate) {
      expiryDate.setHours(0, 0, 0, 0); // Set to start of day
    }
    
    const usageCount = backendVoucher.usageCount || 0;
    const maxUsage = backendVoucher.batas_penggunaan || backendVoucher.maxUsage || null;
    
    // Determine status based on expiry date and usage limit
    let status: "active" | "inactive" | "expired";
    
    // Check if voucher is expired by date
    if (expiryDate && expiryDate < today) {
      status = "expired";
    }
    // Check if voucher has reached max usage
    else if (maxUsage !== null && usageCount >= maxUsage) {
      status = "inactive"; // or "expired" if you prefer
    }
    // Otherwise, it's active
    else {
      status = "active";
    }

    return {
      id: backendVoucher.id?.toString() || "",
      nama: backendVoucher.nama || "",
      code: backendVoucher.kode || backendVoucher.code || "",
      kode: backendVoucher.kode || backendVoucher.code || "",
      discount: backendVoucher.persen || backendVoucher.discount || 0,
      persen: backendVoucher.persen || backendVoucher.discount || 0,
      discountType: "percentage", // Backend hanya support percentage
      expiryDate: expiryDateStr || new Date().toISOString().split("T")[0],
      tanggal_mulai: backendVoucher.tanggal_mulai || null,
      tanggal_selesai: backendVoucher.tanggal_selesai || null,
      usageCount: usageCount,
      maxUsage: maxUsage,
      batas_penggunaan: backendVoucher.batas_penggunaan || 0,
      status: status,
      qr_code: backendVoucher.qr_code,
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
        errorMessage = "Backend server tidak dapat diakses. Pastikan server backend running";
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
      // Backend expects: { nama, persen, kode, tanggal_mulai?, tanggal_selesai?, batas_penggunaan? }
      const payload: any = {
        nama: newVoucher.nama || `Voucher ${newVoucher.code}`,
        persen: newVoucher.discount || newVoucher.persen,
        kode: (newVoucher.code || newVoucher.kode).toUpperCase(),
      };
      
      // Add optional fields if present
      if (newVoucher.tanggal_mulai !== undefined) payload.tanggal_mulai = newVoucher.tanggal_mulai;
      if (newVoucher.tanggal_selesai !== undefined) payload.tanggal_selesai = newVoucher.tanggal_selesai;
      if (newVoucher.batas_penggunaan !== undefined) payload.batas_penggunaan = newVoucher.batas_penggunaan;

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
      // Backend expects: { nama?, persen?, kode?, tanggal_mulai?, tanggal_selesai?, batas_penggunaan? }
      const payload: any = {};
      
      if (updates.nama) payload.nama = updates.nama;
      if (updates.code || updates.kode) payload.kode = updates.code || updates.kode;
      if (updates.discount !== undefined || updates.persen !== undefined) {
        payload.persen = updates.discount !== undefined ? updates.discount : updates.persen;
      }
      if (updates.tanggal_mulai !== undefined) payload.tanggal_mulai = updates.tanggal_mulai;
      if (updates.tanggal_selesai !== undefined) payload.tanggal_selesai = updates.tanggal_selesai;
      if (updates.batas_penggunaan !== undefined) payload.batas_penggunaan = updates.batas_penggunaan;

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
    // For now, just update locally and recalculate status
    setVouchers(
      vouchers.map((v) => {
        if (v.id === id) {
          const newUsageCount = v.usageCount + 1;
          
          // Recalculate status after incrementing usage
          let newStatus: "active" | "inactive" | "expired" = v.status;
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = v.expiryDate ? new Date(v.expiryDate) : null;
          if (expiryDate) {
            expiryDate.setHours(0, 0, 0, 0);
          }
          
          // Check if expired by date
          if (expiryDate && expiryDate < today) {
            newStatus = "expired";
          }
          // Check if reached max usage
          else if (v.maxUsage !== null && newUsageCount >= v.maxUsage) {
            newStatus = "inactive";
          }
          // Otherwise active
          else {
            newStatus = "active";
          }
          
          return { 
            ...v, 
            usageCount: newUsageCount,
            status: newStatus
          };
        }
        return v;
      })
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
