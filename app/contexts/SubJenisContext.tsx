"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { SubJenis } from "@/lib/types";

interface SubJenisContextType {
  subJenisList: SubJenis[];
  loading: boolean;
  error: string | null;
  fetchSubJenis: () => Promise<void>;
  getSubJenisById: (id: number) => Promise<SubJenis | null>;
  getSubJenisByJenisId: (jenisId: number) => SubJenis[];
  createSubJenis: (data: Omit<SubJenis, "id">) => Promise<SubJenis | null>;
  updateSubJenis: (
    id: number,
    data: Partial<Omit<SubJenis, "id">>
  ) => Promise<SubJenis | null>;
  deleteSubJenis: (id: number) => Promise<boolean>;
  // Product-SubJenis relationship methods
  addSubJenisToProduct: (
    productId: number,
    subJenisId: number
  ) => Promise<boolean>;
  removeSubJenisFromProduct: (
    productId: number,
    subJenisId: number
  ) => Promise<boolean>;
}

const SubJenisContext = createContext<SubJenisContextType | undefined>(
  undefined
);

export function SubJenisProvider({ children }: { children: ReactNode }) {
  const [subJenisList, setSubJenisList] = useState<SubJenis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback: Extract sub_jenis from products if main endpoint fails
  const fetchSubJenisFromProducts = async (): Promise<SubJenis[]> => {
    try {
      console.log(
        "[SubJenisContext] Fetching sub_jenis from products (fallback)..."
      );
      const response = await fetch("/api/products");
      if (!response.ok) return [];

      const result = await response.json();
      const products = result.data || result;

      if (!Array.isArray(products)) return [];

      // Extract unique sub_jenis from all products with jenis_id mapping
      const subJenisMap = new Map<number, SubJenis>();

      // Define types for product structure
      interface ProductJenis {
        id: number;
        nama_id: string;
        nama_en: string;
      }
      interface ProductSubJenis {
        id: number;
        nama_id: string;
        nama_en: string;
        jenis_id?: number;
        ref_jenis_id?: number;
      }
      interface ProductData {
        id: number;
        jenis?: ProductJenis[];
        sub_jenis?: ProductSubJenis[];
      }

      products.forEach((product: ProductData) => {
        if (Array.isArray(product.sub_jenis)) {
          product.sub_jenis.forEach((sj) => {
            if (!subJenisMap.has(sj.id)) {
              // Try to find corresponding jenis_id from product's jenis array
              // Usually sub_jenis is related to jenis in the same product
              let jenisId = sj.jenis_id ?? sj.ref_jenis_id ?? 0;

              // If no jenis_id, try to infer from product's jenis (first one that matches pattern)
              if (
                jenisId === 0 &&
                Array.isArray(product.jenis) &&
                product.jenis.length > 0
              ) {
                // Map sub_jenis to the first jenis of the product (common pattern)
                jenisId = product.jenis[0].id;
              }

              subJenisMap.set(sj.id, {
                id: sj.id,
                nama_id: sj.nama_id,
                nama_en: sj.nama_en,
                jenis_id: jenisId,
              });
            }
          });
        }
      });

      const extractedSubJenis = Array.from(subJenisMap.values());
      console.log(
        "[SubJenisContext] Extracted sub_jenis from products:",
        extractedSubJenis
      );
      return extractedSubJenis;
    } catch (err) {
      console.error("[SubJenisContext] Fallback fetch failed:", err);
      return [];
    }
  };

  // Fetch all sub_jenis
  const fetchSubJenis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[SubJenisContext] Fetching sub_jenis...");
      const response = await fetch("/api/sub_jenis");

      // Log response status for debugging
      console.log("[SubJenisContext] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[SubJenisContext] Error response:", errorData);
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to fetch sub_jenis (${response.status})`
        );
      }

      const result = await response.json();
      console.log("[SubJenisContext] Raw result:", result);

      const data = result.data || result;
      console.log("[SubJenisContext] Parsed data:", data);

      // Check if backend returned error (graceful degradation)
      if (
        result.backendError ||
        (Array.isArray(data) && data.length === 0 && result.backendError)
      ) {
        console.log("[SubJenisContext] Backend error, using fallback...");
        const fallbackData = await fetchSubJenisFromProducts();
        setSubJenisList(fallbackData);
        return;
      }

      // Map ref_jenis_id to jenis_id if needed (backend uses ref_jenis_id)
      const mappedData: SubJenis[] = Array.isArray(data)
        ? data.map((item: Record<string, unknown>) => ({
            id: Number(item.id),
            nama_id: String(item.nama_id || ""),
            nama_en: String(item.nama_en || ""),
            jenis_id: Number(item.jenis_id ?? item.ref_jenis_id ?? 0), // Handle both field names
            min_amount: item.min_amount ? Number(item.min_amount) : undefined,
            max_amount: item.max_amount ? Number(item.max_amount) : undefined,
            PO_closed: item.PO_closed ? String(item.PO_closed) : undefined,
          }))
        : [];

      console.log("[SubJenisContext] Mapped data:", mappedData);

      // If no data from main endpoint, try fallback
      if (mappedData.length === 0) {
        console.log("[SubJenisContext] No data, trying fallback...");
        const fallbackData = await fetchSubJenisFromProducts();
        setSubJenisList(fallbackData);
      } else {
        setSubJenisList(mappedData);
      }
    } catch (err) {
      console.error("[SubJenisContext] Error fetching sub_jenis:", err);
      // Try fallback on error
      const fallbackData = await fetchSubJenisFromProducts();
      if (fallbackData.length > 0) {
        setSubJenisList(fallbackData);
        setError(null); // Clear error since we got data from fallback
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to fetch sub_jenis"
        );
        setSubJenisList([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Get sub_jenis by ID
  const getSubJenisById = useCallback(
    async (id: number): Promise<SubJenis | null> => {
      try {
        const response = await fetch(`/api/sub_jenis/${id}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error("Failed to fetch sub_jenis");
        }
        const result = await response.json();
        return result.data || result;
      } catch (err) {
        console.error("Error fetching sub_jenis by id:", err);
        return null;
      }
    },
    []
  );

  // Get sub_jenis filtered by jenis_id (local filter)
  const getSubJenisByJenisId = useCallback(
    (jenisId: number): SubJenis[] => {
      return subJenisList.filter((sj) => sj.jenis_id === jenisId);
    },
    [subJenisList]
  );

  // Create new sub_jenis
  const createSubJenis = useCallback(
    async (data: Omit<SubJenis, "id">): Promise<SubJenis | null> => {
      try {
        const response = await fetch("/api/sub_jenis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create sub_jenis");
        }

        const result = await response.json();
        const newSubJenis: SubJenis = {
          id: result.id,
          nama_id: result.nama_id || data.nama_id,
          nama_en: result.nama_en || data.nama_en,
          jenis_id: result.jenis_id || data.jenis_id,
        };

        // Update local state
        setSubJenisList((prev) => [...prev, newSubJenis]);
        return newSubJenis;
      } catch (err) {
        console.error("Error creating sub_jenis:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create sub_jenis"
        );
        return null;
      }
    },
    []
  );

  // Update sub_jenis
  const updateSubJenis = useCallback(
    async (
      id: number,
      data: Partial<Omit<SubJenis, "id">>
    ): Promise<SubJenis | null> => {
      try {
        const response = await fetch(`/api/sub_jenis/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update sub_jenis");
        }

        const result = await response.json();
        const updatedSubJenis: SubJenis = {
          id: result.id || id,
          nama_id: result.nama_id,
          nama_en: result.nama_en,
          jenis_id: result.jenis_id,
        };

        // Update local state
        setSubJenisList((prev) =>
          prev.map((sj) => (sj.id === id ? updatedSubJenis : sj))
        );
        return updatedSubJenis;
      } catch (err) {
        console.error("Error updating sub_jenis:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update sub_jenis"
        );
        return null;
      }
    },
    []
  );

  // Delete sub_jenis
  const deleteSubJenis = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sub_jenis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete sub_jenis");
      }

      // Update local state
      setSubJenisList((prev) => prev.filter((sj) => sj.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting sub_jenis:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete sub_jenis"
      );
      return false;
    }
  }, []);

  // Add sub_jenis to product
  const addSubJenisToProduct = useCallback(
    async (productId: number, subJenisId: number): Promise<boolean> => {
      try {
        console.log(
          `[SubJenisContext] Adding sub_jenis ${subJenisId} to product ${productId}`
        );
        const response = await fetch(
          `/api/products/${productId}/sub_jenis/${subJenisId}`,
          {
            method: "POST",
          }
        );

        if (response.status === 409) {
          // Already exists - not an error
          console.log(
            "[SubJenisContext] Sub_jenis already assigned to product"
          );
          return true;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to add sub_jenis to product"
          );
        }

        console.log(
          "[SubJenisContext] Successfully added sub_jenis to product"
        );
        return true;
      } catch (err) {
        console.error("Error adding sub_jenis to product:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to add sub_jenis to product"
        );
        return false;
      }
    },
    []
  );

  // Remove sub_jenis from product
  const removeSubJenisFromProduct = useCallback(
    async (productId: number, subJenisId: number): Promise<boolean> => {
      try {
        console.log(
          `[SubJenisContext] Removing sub_jenis ${subJenisId} from product ${productId}`
        );
        const response = await fetch(
          `/api/products/${productId}/sub_jenis/${subJenisId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Not found - maybe already removed
            console.log(
              "[SubJenisContext] Sub_jenis not found on product (may already be removed)"
            );
            return true;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to remove sub_jenis from product"
          );
        }

        console.log(
          "[SubJenisContext] Successfully removed sub_jenis from product"
        );
        return true;
      } catch (err) {
        console.error("Error removing sub_jenis from product:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to remove sub_jenis from product"
        );
        return false;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchSubJenis();
  }, [fetchSubJenis]);

  return (
    <SubJenisContext.Provider
      value={{
        subJenisList,
        loading,
        error,
        fetchSubJenis,
        getSubJenisById,
        getSubJenisByJenisId,
        createSubJenis,
        updateSubJenis,
        deleteSubJenis,
        addSubJenisToProduct,
        removeSubJenisFromProduct,
      }}
    >
      {children}
    </SubJenisContext.Provider>
  );
}

export function useSubJenis() {
  const context = useContext(SubJenisContext);
  if (context === undefined) {
    throw new Error("useSubJenis must be used within a SubJenisProvider");
  }
  return context;
}
