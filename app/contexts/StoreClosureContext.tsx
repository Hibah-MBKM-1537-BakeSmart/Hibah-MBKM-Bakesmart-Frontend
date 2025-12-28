"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Operating hours structure per day
export interface OperatingHour {
  day_index: number; // 0=Minggu, 1=Senin, ..., 6=Sabtu
  day_name: string;
  is_open: boolean;
  open_time: string; // Format HH:MM
  close_time: string; // Format HH:MM
}

// Backend API structure
export interface StoreConfig {
  id?: number;
  is_tutup: boolean;
  pesan: string;
  tgl_buka: string; // ISO date string for reopening date
  limit_pesanan_harian: number;
  limit_jam_order: string; // Time string like "15:00:00"
  latitude: string;
  longitude: string;
  whatsapp_number: string; // WhatsApp number for contact when closed
  operating_hours: OperatingHour[];
}

// Legacy closure structure for backward compatibility
interface StoreClosure {
  isActive: boolean;
  startDate: string;
  endDate: string;
  reason: string;
}

interface StoreClosureContextType {
  // Legacy closure interface
  closure: StoreClosure;
  updateClosure: (closure: StoreClosure) => void;
  isStoreClosed: () => boolean;
  // New config interface from backend
  config: StoreConfig;
  updateConfig: (config: Partial<StoreConfig>) => Promise<boolean>;
  saveConfig: () => Promise<boolean>;
  refreshConfig: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Default operating hours
const defaultOperatingHours: OperatingHour[] = [
  {
    day_index: 0,
    day_name: "Minggu",
    is_open: true,
    open_time: "08:00",
    close_time: "22:00",
  },
  {
    day_index: 1,
    day_name: "Senin",
    is_open: true,
    open_time: "07:00",
    close_time: "21:00",
  },
  {
    day_index: 2,
    day_name: "Selasa",
    is_open: true,
    open_time: "07:00",
    close_time: "21:00",
  },
  {
    day_index: 3,
    day_name: "Rabu",
    is_open: true,
    open_time: "07:00",
    close_time: "21:00",
  },
  {
    day_index: 4,
    day_name: "Kamis",
    is_open: true,
    open_time: "07:00",
    close_time: "21:00",
  },
  {
    day_index: 5,
    day_name: "Jumat",
    is_open: true,
    open_time: "07:00",
    close_time: "21:00",
  },
  {
    day_index: 6,
    day_name: "Sabtu",
    is_open: true,
    open_time: "08:00",
    close_time: "22:00",
  },
];

const defaultConfig: StoreConfig = {
  is_tutup: false,
  pesan: "",
  tgl_buka: "",
  limit_pesanan_harian: 20,
  limit_jam_order: "15:00:00",
  latitude: "",
  longitude: "",
  whatsapp_number: "",
  operating_hours: defaultOperatingHours,
};

const StoreClosureContext = createContext<StoreClosureContextType | undefined>(
  undefined
);

export function StoreClosureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Legacy closure state for backward compatibility
  const [closure, setClosure] = useState<StoreClosure>({
    isActive: false,
    startDate: "",
    endDate: "",
    reason: "",
  });

  // New config state from backend
  const [config, setConfig] = useState<StoreConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch config from backend API
  const refreshConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/config");

      if (!response.ok) {
        throw new Error("Failed to fetch config");
      }

      const data = await response.json();

      // Ensure operating_hours is always an array
      if (!data.operating_hours || !Array.isArray(data.operating_hours)) {
        data.operating_hours = defaultOperatingHours;
      }

      setConfig(data);

      // Sync legacy closure state with backend config
      setClosure({
        isActive: data.is_tutup || false,
        startDate: "",
        endDate: data.tgl_buka ? data.tgl_buka.split("T")[0] : "",
        reason: data.pesan || "",
      });
    } catch (err) {
      console.error("Error fetching config:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch config");
      // Fall back to localStorage for legacy support
      const saved = localStorage.getItem("storeClosure");
      if (saved) {
        setClosure(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load config on mount
  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  // Update local config state
  const updateConfig = async (
    newConfig: Partial<StoreConfig>
  ): Promise<boolean> => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    return true;
  };

  // Save config to backend
  const saveConfig = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save config");
      }

      const data = await response.json();

      // Ensure operating_hours is always an array
      if (!data.operating_hours || !Array.isArray(data.operating_hours)) {
        data.operating_hours = defaultOperatingHours;
      }

      setConfig(data);

      // Sync legacy closure state
      setClosure({
        isActive: data.is_tutup || false,
        startDate: "",
        endDate: data.tgl_buka ? data.tgl_buka.split("T")[0] : "",
        reason: data.pesan || "",
      });

      return true;
    } catch (err) {
      console.error("Error saving config:", err);
      setError(err instanceof Error ? err.message : "Failed to save config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy update closure function (also updates backend)
  const updateClosure = (newClosure: StoreClosure) => {
    setClosure(newClosure);
    localStorage.setItem("storeClosure", JSON.stringify(newClosure));

    // Sync with backend config
    setConfig((prev) => ({
      ...prev,
      is_tutup: newClosure.isActive,
      pesan: newClosure.reason,
      tgl_buka: newClosure.endDate
        ? new Date(newClosure.endDate).toISOString()
        : "",
    }));
  };

  const isStoreClosed = () => {
    const now = new Date();

    // Check if store is manually closed via backend config
    if (config.is_tutup) {
      // Check if reopening date has passed
      if (config.tgl_buka) {
        const reopenDate = new Date(config.tgl_buka);
        if (now < reopenDate) {
          return true;
        }
      } else {
        return true;
      }
    }

    // Check scheduled closure (legacy)
    if (closure.isActive && closure.startDate && closure.endDate) {
      const [startYear, startMonth, startDay] = closure.startDate
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = closure.endDate
        .split("-")
        .map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
      const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

      if (now >= startDate && now <= endDate) {
        return true;
      }
    }

    // Check order time limit
    if (config.limit_jam_order) {
      const [limitHours, limitMinutes] = config.limit_jam_order
        .split(":")
        .map(Number);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;
      const limitTime = limitHours * 60 + limitMinutes;

      if (currentTime >= limitTime) {
        return true; // Past order cutoff time for today
      }
    }

    // Check regular operating hours from backend config
    const day = now.getDay(); // 0=Minggu, 1=Senin, dst
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Find today's operating hours from config
    const todayHours = config.operating_hours?.find((h) => h.day_index === day);

    if (todayHours) {
      // Jika hari ini toko tidak buka
      if (!todayHours.is_open) {
        return true;
      }

      // Parse open and close time
      const [openH, openM] = todayHours.open_time.split(":").map(Number);
      const [closeH, closeM] = todayHours.close_time.split(":").map(Number);
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;

      // Check if current time is within operating hours
      if (currentTime < openTime || currentTime >= closeTime) {
        return true; // Outside operating hours
      }

      return false; // Store is open
    }

    // Fallback: jika tidak ada data operating_hours, gunakan logic default
    if (day === 0 || day === 6) {
      // Sabtu-Minggu: 08:00-22:00
      return !(currentTime >= 8 * 60 && currentTime < 22 * 60);
    } else {
      // Senin-Jumat: 07:00-21:00
      return !(currentTime >= 7 * 60 && currentTime < 21 * 60);
    }
  };

  return (
    <StoreClosureContext.Provider
      value={{
        closure,
        updateClosure,
        isStoreClosed,
        config,
        updateConfig,
        saveConfig,
        refreshConfig,
        isLoading,
        error,
      }}
    >
      {children}
    </StoreClosureContext.Provider>
  );
}

export function useStoreClosure() {
  const context = useContext(StoreClosureContext);
  if (!context) {
    throw new Error("useStoreClosure must be used within StoreClosureProvider");
  }
  return context;
}
