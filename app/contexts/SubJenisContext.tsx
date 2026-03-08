"use client";

import React, { ReactNode, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import {
  SubJenis,
  SubJenisProviderBase,
  useSubJenisCrud,
} from "./SubJenisCrud";

interface ExtendedSubJenisContext {
  subJenisList: SubJenis[];
  loading: boolean;
  errors: Record<string, string | null>;
  fetchSubJenis: () => Promise<void>;
  createSubJenis: (data: Omit<SubJenis, "id">) => Promise<SubJenis | null>;
  updateSubJenis: ( id: number, data: Partial<SubJenis> ) => Promise<SubJenis | null>;
  deleteSubJenis: (id: number) => Promise<boolean>;

  getSubJenisByJenisId: (jenisId: number) => SubJenis[];
  addSubJenisToProduct: ( productId: number, subJenisId: number ) => Promise<boolean>;
  appendHariToSubJenis: ( subJenisId: number, hariId: number, ) => Promise<boolean>;
  removeHariFromSubJenis: ( subJenisId: number, hariId: number, ) => Promise<boolean>;

  createAttribute : (attr: { nama_id: string; nama_en: string; }) => Promise<{ id: number; nama_id: string; nama_en: string; } | null>;
  appendAttributeToSubJenis: ( subJenisId: number, attributeId: number, attr: { nama_id: string; nama_en: string; harga?: number } ) => Promise<boolean>;
  removeAttributeFromSubJenis: ( subJenisId: number, attributeId: number ) => Promise<boolean>;

  removeSubJenisFromProduct: ( productId: number, subJenisId: number ) => Promise<boolean>;
}

const ExtendedContext =
  React.createContext<ExtendedSubJenisContext | undefined>(
    undefined
  );

export function SubJenisProvider({ children }: { children: ReactNode }) {
  return (
    <SubJenisProviderBase>
      <ExtendedProvider>{children}</ExtendedProvider>
    </SubJenisProviderBase>
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
  } = useSubJenisCrud();

  const getSubJenisByJenisId = useCallback(
    (jenisId: number) => list.filter((sj) => sj.jenis_id === jenisId),
    [list]
  );

  const addSubJenisToProduct = async (
    productId: number,
    subJenisId: number
  ) => {
    try {
      const res = await fetchWithAuth(
        `/api/products/${productId}/sub_jenis/${subJenisId}`,
        { method: "POST" }
      );

      if (res.status === 409) return true;
      if (!res.ok) throw new Error();

      return true;
    } catch {
      return false;
    }
  };

  const removeSubJenisFromProduct = async (
    productId: number,
    subJenisId: number
  ) => {
    try {
      const res = await fetchWithAuth(
        `/api/products/${productId}/sub_jenis/${subJenisId}`,
        { method: "DELETE" }
      );

      if (res.status === 404) return true;
      if (!res.ok) throw new Error();

      return true;
    } catch {
      return false;
    }
  };

  const appendHariToSubJenis = async (
    subJenisId: number,
    hariId: number,
  ) => {
    try {
      const res = await fetchWithAuth(
        `/api/sub_jenis/${subJenisId}/hari/${hariId}`,
        { method: "POST" }
      );

      if (res.status === 404) return true;
      if (!res.ok) throw new Error();

      return true;
    } catch {
      return false;
    }
  };

  const removeHariFromSubJenis = async (
    subJenisId: number,
    hariId: number,
  ) => {
    try {
      const res = await fetchWithAuth(
        `/api/sub_jenis/${subJenisId}/hari/${hariId}`,
        { method: "DELETE" }
      );

      if (res.status === 404) return true;
      if (!res.ok) throw new Error();

      return true;
    } catch {
      return false;
    }
  };

  const createAttribute = async (attr: { nama_id: string; nama_en: string; }) => {
    try {
      const normalizedId = attr.nama_id.trim().toLowerCase();
      const normalizedEn = attr.nama_en.trim().toLowerCase();

      const checkRes = await fetch("/api/atribut");
      if (!checkRes.ok) throw new Error("Failed to fetch");
      const data = await checkRes.json();

      const existingAttrs = data.data;

      const existingAttr = existingAttrs.find((a: any) =>
        a.nama_id?.trim().toLowerCase() === normalizedId ||
        a.nama_en?.trim().toLowerCase() === normalizedEn
      );

      // If already exists, return it
      if (existingAttr) {
        // console.log("Atribut sudah ada:", existingAttr);
        return existingAttr;
      }

      const res = await fetchWithAuth("/api/atribut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...attr, harga: 0 }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      // console.log("Atribut baru dibuat:", result);
      return result;
    } catch {
      return null;
    }
  };

  const appendAttributeToSubJenis = async (
    subJenisId: number,
    attributeId: number,
    attr: { nama_id: string; nama_en: string; harga?: number }
  ) => {
    try {
      // Append attribute with harga
      if (attributeId) {
        const appendRes = await fetch(
          `/api/sub_jenis/${subJenisId}/attribute/${attributeId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              harga: attr.harga || 0,
            }),
          }
        );

        if (!appendRes.ok && appendRes.status !== 409) {
          throw new Error("Gagal menambahkan atribut");
        }
      }

      return true;
    } catch {
      return false;
    }
  };

  const removeAttributeFromSubJenis = async (
    subJenisId: number,
    attributeId: number,
  ) => {
    try {
      const appendRes = await fetch(
        `/api/sub_jenis/${subJenisId}/attribute/${attributeId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!appendRes.ok && appendRes.status !== 409) {
        throw new Error("Gagal menghapus atribut");
      }

      return true;
    } catch {
      return false;
    }
  };

  return (
    <ExtendedContext.Provider
      value={{
        subJenisList: list,
        loading,
        errors,
        fetchSubJenis: fetchAll,
        createSubJenis: create,
        updateSubJenis: update,
        deleteSubJenis: remove,
        appendHariToSubJenis,
        removeHariFromSubJenis,
        createAttribute,
        appendAttributeToSubJenis,
        removeAttributeFromSubJenis,
        getSubJenisByJenisId,
        addSubJenisToProduct,
        removeSubJenisFromProduct,
      }}
    >
      {children}
    </ExtendedContext.Provider>
  );
}

export function useSubJenis() {
  const ctx = React.useContext(ExtendedContext);
  if (!ctx) throw new Error("useSubJenis must be inside Provider");
  return ctx;
}