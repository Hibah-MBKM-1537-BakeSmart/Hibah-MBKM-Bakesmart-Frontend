"use client";

import React, { ReactNode, } from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { Product, FormProduct, ProductProviderBase, useProductCrud } from "./ProductCrud";

interface ExtendedProductContext {
  productList: Product[];
  loading: boolean;
  errors: Record<string, string | null>;
  fetchProduct: () => Promise<void>;
  createProduct: (data: FormProduct) => Promise<Product | null>;
  updateProduct: (id: number, data: Partial<FormProduct>) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  appendBahanToProduct: (productId: number, bahanId: number, bahan: { nama_id: string; nama_en: string; jumlah?: number }) => Promise<boolean>;
  removeBahanFromProduct: (productId: number, bahanId: number) => Promise<boolean>;
  appendGambarToProduct: (productId: number, file: File) => Promise<boolean>;
  removeGambarFromProduct: (productId: number, gambarId: number) => Promise<boolean>;
  exportProduct: () => Promise<void>;
  importProduct: (file: File) => Promise<unknown>;
}

const ExtendedContext =
  React.createContext<ExtendedProductContext | undefined>(
    undefined
  );

export function ProductProvider({ children }: { children: ReactNode }) {
  return (
    <ProductProviderBase>
      <ExtendedProvider>{children}</ExtendedProvider>
    </ProductProviderBase>
  );
}

function ExtendedProvider({ children }: { children: ReactNode }) {
  const {
    list,
    loading,
    errors,
    fetchAll,
    create,
    update,
    remove,
  } = useProductCrud();

  const appendBahanToProduct = async (
    productId: number,
    bahanId: number,
    bahan: { nama_id: string; nama_en: string; jumlah?: number }
  ) => {
    try {
      // Create bahan if ID not provided
      if (!bahanId || bahanId == 0) {
        const bahanRes = await fetch("/api/bahan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_id: bahan.nama_id,
            nama_en: bahan.nama_en,
          }),
        });

        if (!bahanRes.ok) throw new Error("Gagal membuat bahan");

        const bahanResult = await bahanRes.json();
        bahanId = bahanResult.id || bahanResult?.data?.id;
      }

      // Append bahan to product
      const appendRes = await fetch(
        `/api/products/${productId}/bahan/${bahanId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jumlah: bahan.jumlah || 0,
          }),
        }
      );

      if (!appendRes.ok && appendRes.status !== 409) {
        throw new Error("Gagal menambahkan bahan");
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const removeBahanFromProduct = async (
    productId: number,
    bahanId: number,
  ) => {
    try {
      const appendRes = await fetch(
        `/api/products/${productId}/bahan/${bahanId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!appendRes.ok && appendRes.status !== 409) {
        throw new Error("Gagal menghapus bahan");
      }

      return true;
    } catch {
      return false;
    }
  };
  
  const appendGambarToProduct = async (
    productId: number,
    file: File
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const appendRes = await fetch(
        `/api/products/${productId}/gambar`,
        {
          method: "POST",
          body: formData, // ❗ DO NOT set Content-Type
        }
      );

      if (!appendRes.ok && appendRes.status !== 409) {
        throw new Error("Gagal menambahkan gambar");
      }

      return true;
    } catch {
      return false;
    }
  };

  const removeGambarFromProduct = async (
    productId: number,
    gambarId: number,
  ) => {
    try {
      const appendRes = await fetch(
        `/api/products/${productId}/gambar/${gambarId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!appendRes.ok && appendRes.status !== 409) {
        throw new Error("Gagal menghapus gambar");
      }

      return true;
    } catch {
      return false;
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
      return result;
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  const createProductWrapper = async (data: FormProduct) => {
    return create(data as Omit<Product, "id">);
  };

  const updateProductWrapper = async (id : number, data: Partial<FormProduct>) => {
    return update(id, data as Omit<Product, "id">);
  };

  return (
    <ExtendedContext.Provider
      value={{
        productList: list,
        loading,
        errors,
        fetchProduct: fetchAll,
        createProduct: createProductWrapper,
        updateProduct: updateProductWrapper,
        deleteProduct: remove,
        appendBahanToProduct,
        removeBahanFromProduct,
        appendGambarToProduct,
        removeGambarFromProduct,
        exportProduct,
        importProduct,
      }}
    >
      {children}
    </ExtendedContext.Provider>
  );
}

export function useProducts() {
  const ctx = React.useContext(ExtendedContext);
  if (!ctx) throw new Error("useProducts must be inside Provider");
  return ctx;
}