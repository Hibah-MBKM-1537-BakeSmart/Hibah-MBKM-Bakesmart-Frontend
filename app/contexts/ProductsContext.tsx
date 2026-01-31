"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

// Use Next.js API route instead of direct backend call to avoid CORS
const BACKEND_URL = "/api/products";

export interface Product {
  id: number;
  nama_id?: string;
  nama_en?: string;
  nama: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
  deskripsi: string;
  harga: number;
  harga_diskon?: number | null;
  stok: number;
  isBestSeller?: boolean;
  isDaily?: boolean;
  daily_stock?: number | null;
  created_at?: string;
  updated_at?: string;
  gambars?: Array<{
    id: number;
    file_path: string;
    product_id?: number;
  }>;
  jenis?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
  }>;
  sub_jenis?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
    jenis_id?: number;
  }>;
  hari?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
  }>;
  attributes?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
    harga?: number;
  }>;
  bahans?: Array<{
    id: number;
    nama_id?: string;
    nama_en?: string;
    nama: string;
    jumlah?: number;
  }>;
  addons?: Array<{
    id: number;
    nama: string;
    harga_tambahan: number;
    is_active: boolean;
  }>;
  vouchers?: Array<{
    id: number;
    kode?: string;
    nama?: string;
  }>;
  sales?: number;
  rating?: number;
  status: "active" | "inactive";
  hari_tersedia?: string[];
}

// Tambahkan tipe definisi baru untuk menghindari konflik tipe pada properti 'bahans'
export type ProductCreateData = Partial<Omit<Product, "bahans">> & {
  sub_jenis_ids?: number[];
  jenis_id?: number;
  imageFiles?: File[];
  bahans?: Array<{ nama_id: string; nama_en: string; jumlah: number }>;
};

export type ProductUpdateData = Partial<Omit<Product, "bahans">> & {
  sub_jenis_ids?: number[];
  bahans?: Array<{ nama_id: string; nama_en: string; jumlah: number }>;
};

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isBackendConnected: boolean;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  isBackendConnected: boolean;
  addProduct: (productData: ProductCreateData) => Promise<void>;

  updateProduct: (id: number, productData: ProductUpdateData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  exportProduct: () => Promise<void>;
  importProduct: (file: File) => Promise<any>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    isBackendConnected: false,
  });

  // Helper function to parse backend response
  const parseBackendResponse = (data: any): Product[] => {
    console.log("[ProductsContext] Parsing backend response:", data);

    // Handle different response formats
    let productsArray: any[] = [];

    if (Array.isArray(data)) {
      productsArray = data;
    } else if (data?.data) {
      if (Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        productsArray = data.data.data;
      }
    }

    console.log(
      "[ProductsContext] Found products array:",
      productsArray.length
    );

    // Map backend format to frontend format
    return productsArray.map((product: any) => ({
      id: product.id,
      nama_id: product.nama_id,
      nama_en: product.nama_en,
      nama: product.nama_en || product.nama_id || product.nama || "",
      deskripsi_id: product.deskripsi_id,
      deskripsi_en: product.deskripsi_en,
      deskripsi:
        product.deskripsi_en || product.deskripsi_id || product.deskripsi || "",
      harga: product.harga || 0,
      harga_diskon: product.harga_diskon || null,
      stok: product.stok ?? 0,
      isBestSeller: product.isBestSeller || false,
      isDaily: product.isDaily || false,
      daily_stock: product.daily_stock || null,
      created_at: product.created_at,
      updated_at: product.updated_at,
      status: (product.status || "active") as "active" | "inactive",
      gambars: product.gambars?.filter((g: any) => g && g.id) || [],
      jenis:
        product.jenis
          ?.filter((j: any) => j && j.id)
          .map((j: any) => ({
            id: j.id,
            nama: j.nama_en || j.nama_id || j.nama || "Unknown",
            nama_id: j.nama_id,
            nama_en: j.nama_en,
          })) || [],
      sub_jenis:
        product.sub_jenis
          ?.filter((sj: any) => sj && sj.id)
          .map((sj: any) => ({
            id: sj.id,
            nama: sj.nama_en || sj.nama_id || sj.nama || "Unknown",
            nama_id: sj.nama_id,
            nama_en: sj.nama_en,
            jenis_id: sj.jenis_id,
          })) || [],
      hari:
        product.hari
          ?.filter((h: any) => h && h.id)
          .map((h: any) => ({
            id: h.id,
            nama: h.nama_en || h.nama_id || h.nama || "",
            nama_id: h.nama_id,
            nama_en: h.nama_en,
          })) || [],
      attributes:
        product.attributes
          ?.filter((a: any) => a && a.id)
          .map((a: any) => ({
            id: a.id,
            nama: a.nama_en || a.nama_id || a.nama || "",
            harga: a.harga,
            nama_id: a.nama_id,
            nama_en: a.nama_en,
          })) || [],
      bahans:
        product.bahans
          ?.filter((b: any) => b && b.id)
          .map((b: any) => ({
            id: b.id,
            nama: b.nama_en || b.nama_id || b.nama || "",
            jumlah: b.jumlah,
            nama_id: b.nama_id,
            nama_en: b.nama_en,
          })) || [],
      sales: product.sales || 0,
      rating: product.rating || 0,
      hari_tersedia: product.hari_tersedia || [],
    }));
  };

  // Fetch products from backend
  const refreshProducts = async (): Promise<void> => {
    try {
      console.log("[ProductsContext] Refreshing products from backend...");
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds

      const response = await fetchWithAuth(BACKEND_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[ProductsContext] Backend response:", data);

      const products = parseBackendResponse(data);
      console.log("[ProductsContext] Parsed products:", products.length);

      setState((prev) => ({
        ...prev,
        products,
        loading: false,
        error: null,
        isBackendConnected: true,
      }));
    } catch (error: any) {
      console.error("[ProductsContext] Error fetching products:", error);

      let errorMessage = "Tidak dapat terhubung ke backend. ";
      if (error.name === "AbortError") {
        errorMessage =
          "⏱️ Backend tidak merespons dalam 10 detik. Pastikan backend server berjalan";
      } else if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("fetch")
      ) {
        errorMessage =
          "🔌 Backend server tidak dapat diakses. Pastikan backend berjalan";
      } else if (error.message?.includes("ECONNREFUSED")) {
        errorMessage = "❌ Koneksi ditolak. Backend server tidak berjalan";
      } else {
        errorMessage += error.message;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isBackendConnected: false,
      }));
    }
  };

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, []);

  // Create product - NEW: Backend accepts all data in single POST request
  // POST /products with complete payload
  // Note: hari_ids NOT needed - hari configuration comes from sub_jenis
  const addProduct = async (
    productData: ProductCreateData
  ): Promise<void> => {
    try {
      console.log("[ProductsContext] Creating product:", productData);
      setState((prev) => ({ ...prev, error: null }));

      // Extract imageFiles for separate upload
      const { imageFiles, gambars, ...productPayload } = productData;

      // Backend expects ALL data in one payload
      const createPayload = {
        nama_id: productPayload.nama_id || productPayload.nama,
        nama_en: productPayload.nama_en || productPayload.nama,
        deskripsi_id:
          productPayload.deskripsi_id || productPayload.deskripsi || "",
        deskripsi_en:
          productPayload.deskripsi_en || productPayload.deskripsi || "",
        harga: productPayload.harga || 0,
        harga_diskon: productPayload.harga_diskon || null,
        // stok removed - backend doesn't need it for create
        isBestSeller: productPayload.isBestSeller || false,
        isDaily: productPayload.isDaily || false,
        daily_stock: productPayload.daily_stock || null,
        // Include relations in the payload
        sub_jenis_ids: productPayload.sub_jenis_ids || [],
        // hari_ids NOT sent - hari comes from sub_jenis configuration
        jenis_id: productPayload.jenis_id,
        bahans: productPayload.bahans || [],
      };

      console.log(
        "[ProductsContext] Creating product with payload:",
        createPayload
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetchWithAuth(BACKEND_URL, {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify(createPayload),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("[ProductsContext] Product created successfully:", data);

      // Get the created product ID for image upload
      const productId = data.data?.id || data.id;
      if (!productId) {
        throw new Error("Product created but no ID returned");
      }

      // Upload images separately (if provided)
      if (imageFiles && imageFiles.length > 0) {
        console.log("[ProductsContext] Uploading images:", imageFiles.length);
        for (const file of imageFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);

            // Use plain fetch with manual auth header for FormData
            // Don't use fetchWithAuth as it sets Content-Type: application/json
            const token = localStorage.getItem("bakesmart_admin_auth");
            const authHeader = token ? JSON.parse(token).token : null;
            
            const headers: HeadersInit = {};
            if (authHeader) {
              headers["Authorization"] = `Bearer ${authHeader}`;
            }
            // Don't set Content-Type - browser will set it automatically with boundary

            const imageResponse = await fetch(
              `${BACKEND_URL}/${productId}/gambar`,
              {
                method: "POST",
                body: formData,
                headers,
              }
            );
            if (!imageResponse.ok) {
              console.warn(
                `[ProductsContext] Failed to upload image ${file.name}`
              );
            }
          } catch (err) {
            console.warn(`[ProductsContext] Error uploading image:`, err);
          }
        }
      }

      console.log("[ProductsContext] Product creation completed");

      // Refresh products to get the complete data with relations
      await refreshProducts();
    } catch (error: any) {
      console.error("[ProductsContext] Error creating product:", error);

      let errorMessage = "Gagal menambahkan produk. ";
      if (error.name === "AbortError") {
        errorMessage += "Request timeout.";
      } else {
        errorMessage += error.message;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // Update product
  const updateProduct = async (
    id: number,
    productData: ProductUpdateData
  ): Promise<void> => {
    try {
      console.log("[ProductsContext] Updating product:", id, productData);
      setState((prev) => ({ ...prev, error: null }));

      // Build the update payload with correct structure
      const updatePayload: Record<string, any> = {
        nama_id: productData.nama_id,
        nama_en: productData.nama_en,
        deskripsi_id: productData.deskripsi_id,
        deskripsi_en: productData.deskripsi_en,
        harga: productData.harga,
        harga_diskon: productData.harga_diskon ?? null,
        isBestSeller: productData.isBestSeller ?? false,
        isDaily: productData.isDaily ?? false,
        daily_stock: productData.daily_stock ?? null,
        sub_jenis_ids: productData.sub_jenis_ids || [],
        bahans: (productData.bahans || []).map((b) => ({
          nama_id: b.nama_id,
          nama_en: b.nama_en,
          jumlah: typeof b.jumlah === "string" ? parseInt(b.jumlah, 10) : b.jumlah,
        })),
      };

      console.log("[ProductsContext] Update payload:", updatePayload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetchWithAuth(`${BACKEND_URL}/${id}`, {
        method: "PUT",
        signal: controller.signal,
        body: JSON.stringify(updatePayload),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(
        "[ProductsContext] Backend PUT response:",
        JSON.stringify(data)
      );

      // Immediately update local state with optimistic data
      // Don't rely on backend response format, use what we sent
      setState((prev) => {
        console.log(
          "[ProductsContext] Updating state, current products:",
          prev.products.length
        );
        const updatedProducts = prev.products.map((product) => {
          if (product.id === id) {
            // Transformasi 'bahans' agar sesuai interface Product (perlu id dan nama)
            const updatedBahans = productData.bahans
              ? productData.bahans.map((b) => ({
                  id: Math.random(), // ID sementara untuk UI
                  nama: b.nama_en || b.nama_id, // Default nama dari nama_en/id
                  nama_id: b.nama_id,
                  nama_en: b.nama_en,
                  jumlah: b.jumlah,
                }))
              : product.bahans;

            // Pisahkan properti yang tidak kompatibel (bahans & sub_jenis_ids)
            // sub_jenis_ids tidak bisa langsung di-spread ke Product karena Product butuh sub_jenis (array objek)
            const { bahans, sub_jenis_ids, ...restData } = productData;

            const updated: Product = {
              ...product,
              ...restData,
              bahans: updatedBahans,
            };

            console.log(`[ProductsContext] Updating product ${id}:`, updated);
            return updated;
          }
          return product;
        });
        console.log(
          "[ProductsContext] New products array:",
          updatedProducts.length
        );
        return {
          ...prev,
          products: updatedProducts,
          loading: false,
        };
      });

      console.log("[ProductsContext] State update completed");
    } catch (error: any) {
      console.error("[ProductsContext] Error updating product:", error);

      let errorMessage = "Gagal mengupdate produk. ";
      if (error.name === "AbortError") {
        errorMessage += "Request timeout.";
      } else {
        errorMessage += error.message;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id: number): Promise<void> => {
    try {
      console.log("[ProductsContext] Deleting product:", id);
      setState((prev) => ({ ...prev, error: null }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetchWithAuth(`${BACKEND_URL}/${id}`, {
        method: "DELETE",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log("[ProductsContext] Product deleted successfully");

      // Immediately remove from local state
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((product) => product.id !== id),
        loading: false,
      }));

      console.log("[ProductsContext] Product removed from state");
    } catch (error: any) {
      console.error("[ProductsContext] Error deleting product:", error);

      let errorMessage = "Gagal menghapus produk. ";
      if (error.name === "AbortError") {
        errorMessage += "Request timeout.";
      } else {
        errorMessage += error.message;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const exportProduct = async () => {
    try {
      const response = await fetchWithAuth("/api/products/export", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to export products");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const importProduct = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use plain fetch with manual auth header for FormData
      // Don't use fetchWithAuth as it sets Content-Type: application/json
      const token = localStorage.getItem("bakesmart_admin_auth");
      const authHeader = token ? JSON.parse(token).token : null;
      
      const headers: HeadersInit = {};
      if (authHeader) {
        headers["Authorization"] = `Bearer ${authHeader}`;
      }
      // Don't set Content-Type - browser will set it automatically with boundary

      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) throw new Error("Failed to import products");

      const result = await response.json();
      await refreshProducts();
      return result;
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  const contextValue: ProductsContextType = {
    products: state.products,
    loading: state.loading,
    error: state.error,
    isBackendConnected: state.isBackendConnected,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    exportProduct,
    importProduct,
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
