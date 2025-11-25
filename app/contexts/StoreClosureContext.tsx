"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface StoreClosure {
  isActive: boolean;
  startDate: string;
  endDate: string;
  reason: string;
}

interface StoreClosureContextType {
  closure: StoreClosure;
  updateClosure: (closure: StoreClosure) => void;
  isStoreClosed: () => boolean;
}

const StoreClosureContext = createContext<StoreClosureContextType | undefined>(
  undefined
);

export function StoreClosureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [closure, setClosure] = useState<StoreClosure>({
    isActive: false,
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("storeClosure");
    if (saved) {
      setClosure(JSON.parse(saved));
    }
  }, []);

  const updateClosure = (newClosure: StoreClosure) => {
    setClosure(newClosure);
    localStorage.setItem("storeClosure", JSON.stringify(newClosure));
  };

  const isStoreClosed = () => {
    const now = new Date();

    // Check scheduled closure
    if (closure.isActive && closure.startDate && closure.endDate) {
      // Parse dates from YYYY-MM-DD format
      const [startYear, startMonth, startDay] = closure.startDate
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = closure.endDate
        .split("-")
        .map(Number);

      // Create dates at midnight in local timezone
      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
      const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

      if (now >= startDate && now <= endDate) {
        return true;
      }
    }

    // Check regular operating hours
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Jam operasional: Senin-Jumat 07:00-21:00, Sabtu-Minggu 08:00-22:00
    if (day === 0) {
      // Minggu: 08:00-22:00
      return !(currentTime >= 8 * 60 && currentTime < 22 * 60);
    } else if (day === 6) {
      // Sabtu: 08:00-22:00
      return !(currentTime >= 8 * 60 && currentTime < 22 * 60);
    } else if (day >= 1 && day <= 5) {
      // Senin-Jumat: 07:00-21:00
      return !(currentTime >= 7 * 60 && currentTime < 24 * 60);
    }

    return true;
  };

  return (
    <StoreClosureContext.Provider
      value={{ closure, updateClosure, isStoreClosed }}
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
