"use client";

import { createCrudContext } from "@/app/contexts/crudFactory";

export interface Jenis {
  id: number;
  nama_id?: string;
  nama_en?: string;
  // created_at: string;
  // updated_at: string;
}

export const {
  Provider: JenisProvider,
  useCrud: useJenis
} = createCrudContext<Jenis>("jenis", {
  transform: (cat: any) => ({
    id: cat.id,
    nama: cat.nama_id || cat.nama_en || cat.nama || "",
    nama_id: cat.nama_id,
    nama_en: cat.nama_en,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
  }),

  validateCreate: (data, list) => {
    const exists = list.find(
      c => c.nama_id?.toLowerCase() === data.nama_id?.toLowerCase()
    );
    return exists ? "Jenis sudah ada" : null;
  },

  validateUpdate: (id, data, list) => {
    if (!data.nama_id) return null;

    const exists = list.find(
      c =>
        c.id !== id &&
        c.nama_id?.toLowerCase() === data.nama_id?.toLowerCase()
    );

    return exists ? "Jenis sudah ada" : null;
  }
});