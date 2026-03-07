"use client";

import { createCrudContext } from "@/app/contexts/crudFactory";
import { Jenis } from "./JenisContext";
import { Attribute, FullHari, SubJenis } from "./SubJenisCrud";

export interface Gambar {
  id: number;
  file_path: string;
  product_id?: number;
}

export interface Bahan {
  id: number;
  nama_id: string;
  nama_en: string;
  jumlah: number;
}

export interface Product {
  id: number;
  nama_id?: string;
  nama_en?: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
  calc_count?: number;
  harga: number;
  harga_diskon?: number | null;
  stok: number;
  isBestSeller?: boolean;
  isDaily?: boolean;
  daily_stock?: number | null;
  created_at?: string;
  updated_at?: string;
  gambars?: Gambar[];
  jenis?: Jenis[];
  sub_jenis?: SubJenis;
  hari?: FullHari[];
  attributes?: Attribute[];
  bahans?: Bahan[];
  sales?: number;
  rating?: number;
  status: "active" | "inactive";
}

export interface FormProduct {
  nama_id?: string;
  nama_en?: string;
  deskripsi_id?: string;
  deskripsi_en?: string;
  calc_count?: number;
  harga: number;
  harga_diskon?: number | null;
  isBestSeller?: boolean;
  isDaily?: boolean;
  daily_stock?: number | null;
  ref_sub_jenis_id?: number;
}

export const {
  Provider: ProductProviderBase,
  useCrud: useProductCrud,
} = createCrudContext<Product>("products", {
  transform: (item: any): Product => ({
    id: Number(item.id),
    nama_id: String(item.nama_id || ""),
    nama_en: String(item.nama_en || ""),
    deskripsi_id: String(item.deskripsi_id || ""),
    deskripsi_en: String(item.deskripsi_en || ""),
    harga: Number(item.harga),
    harga_diskon: item.harga_diskon ? Number(item.harga_diskon) : null,
    stok: Number(item.stok),
    isBestSeller: Boolean(item.isBestSeller),
    isDaily: Boolean(item.isDaily),
    daily_stock: item.daily_stock ? Number(item.daily_stock) : null,
    created_at: String(item.created_at),
    updated_at: String(item.updated_at),
    gambars: item.gambars || [],
    jenis: item.jenis || [],
    sub_jenis: item.sub_jenis || [],
    hari: item.hari || [],
    attributes: item.attributes || [],
    bahans: item.bahans || [],
    sales: Number(item.sales || 0),
    rating: Number(item.rating || 0),
    status: (item.status as "active" | "inactive") || "active",
  }),
});