"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Jenis } from "@/lib/types";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

interface JenisContextType {
  jenisList: Jenis[];
  loading: boolean;
  error: string | null;
  fetchJenis: () => Promise<void>;
  getJenisById: (id: number) => Promise<Jenis | null>;
  createJenis: (data: Omit<Jenis, "id">) => Promise<Jenis | null>;
  updateJenis: (id: number, data: Partial<Omit<Jenis, "id">>) => Promise<Jenis | null>;
  deleteJenis: (id: number) => Promise<boolean>;
}

const JenisContext = createContext<JenisContextType | undefined>(undefined);

export function JenisProvider({ children }: { children: ReactNode }) {
  const [jenisList, setJenisList] = useState<Jenis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all jenis
  const fetchJenis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth("/api/jenis");
      if (!response.ok) {
        throw new Error("Failed to fetch jenis");
      }
      const result = await response.json();
      const data = result.data || result;
      setJenisList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jenis:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch jenis");
      setJenisList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get jenis by ID
  const getJenisById = useCallback(async (id: number): Promise<Jenis | null> => {
    try {
      const response = await fetchWithAuth(`/api/jenis/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch jenis");
      }
      const result = await response.json();
      return result.data || result;
    } catch (err) {
      console.error("Error fetching jenis by id:", err);
      return null;
    }
  }, []);

  // Create new jenis
  const createJenis = useCallback(async (data: Omit<Jenis, "id">): Promise<Jenis | null> => {
    try {
      const response = await fetchWithAuth("/api/jenis", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create jenis");
      }
      
      const result = await response.json();
      const newJenis: Jenis = {
        id: result.id,
        nama_id: result.nama_id || data.nama_id,
        nama_en: result.nama_en || data.nama_en,
      };
      
      // Update local state
      setJenisList(prev => [...prev, newJenis]);
      return newJenis;
    } catch (err) {
      console.error("Error creating jenis:", err);
      setError(err instanceof Error ? err.message : "Failed to create jenis");
      return null;
    }
  }, []);

  // Update jenis
  const updateJenis = useCallback(async (id: number, data: Partial<Omit<Jenis, "id">>): Promise<Jenis | null> => {
    try {
      const response = await fetchWithAuth(`/api/jenis/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update jenis");
      }
      
      const result = await response.json();
      const updatedJenis: Jenis = {
        id: result.id || id,
        nama_id: result.nama_id,
        nama_en: result.nama_en,
      };
      
      // Update local state
      setJenisList(prev => prev.map(j => j.id === id ? updatedJenis : j));
      return updatedJenis;
    } catch (err) {
      console.error("Error updating jenis:", err);
      setError(err instanceof Error ? err.message : "Failed to update jenis");
      return null;
    }
  }, []);

  // Delete jenis
  const deleteJenis = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`/api/jenis/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete jenis");
      }
      
      // Update local state
      setJenisList(prev => prev.filter(j => j.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting jenis:", err);
      setError(err instanceof Error ? err.message : "Failed to delete jenis");
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJenis();
  }, [fetchJenis]);

  return (
    <JenisContext.Provider
      value={{
        jenisList,
        loading,
        error,
        fetchJenis,
        getJenisById,
        createJenis,
        updateJenis,
        deleteJenis,
      }}
    >
      {children}
    </JenisContext.Provider>
  );
}

export function useJenis() {
  const context = useContext(JenisContext);
  if (context === undefined) {
    throw new Error("useJenis must be used within a JenisProvider");
  }
  return context;
}
