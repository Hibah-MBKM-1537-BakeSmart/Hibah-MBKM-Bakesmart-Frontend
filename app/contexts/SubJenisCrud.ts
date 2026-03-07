// SubJenisCrud.ts
"use client";

import { createCrudContext } from "@/app/contexts/crudFactory";
import { Jenis } from "./JenisContext";

export interface Hari {
  id: number;
}

export interface FullHari {
  id: number;
  nama_id: string;
  nama_en: string;
}

export interface Attribute {
  id: number;
  nama_id: string;
  nama_en: string;
  harga?: number;
}

export interface SubJenis {
  id: number;
  nama_id: string;
  nama_en: string;
  jenis_id: number;
  jenis?: Jenis;
  min_amount?: number;
  max_amount?: number;
  po_closed?: string;
  hari?: Hari[];
  attributes?: Attribute[];
}

export const {
  Provider: SubJenisProviderBase,
  useCrud: useSubJenisCrud,
} = createCrudContext<SubJenis>("sub_jenis", {
  transform: (item: any): SubJenis => ({
    id: Number(item.id),
    nama_id: String(item.nama_id || ""),
    nama_en: String(item.nama_en || ""),
    jenis_id: Number(item.jenis_id ?? item.ref_jenis_id ?? 0),
    min_amount: item.min_amount
      ? Number(item.min_amount)
      : undefined,
    max_amount: item.max_amount
      ? Number(item.max_amount)
      : undefined,
    po_closed: item.po_closed
      ? String(item.po_closed)
      : undefined,
    hari: item.hari || [],
    attributes: item.attributes || [],
  }),
});