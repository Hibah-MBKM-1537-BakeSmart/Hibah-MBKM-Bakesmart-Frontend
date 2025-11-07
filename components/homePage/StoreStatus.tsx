"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { AlertCircle, CheckCircle } from "lucide-react";

interface StoreHours {
  day: string;
  open: string;
  close: string;
}

const STORE_HOURS: StoreHours[] = [
  { day: "monday", open: "07:00", close: "21:00" },
  { day: "tuesday", open: "07:00", close: "21:00" },
  { day: "wednesday", open: "07:00", close: "21:00" },
  { day: "thursday", open: "07:00", close: "21:00" },
  { day: "friday", open: "07:00", close: "21:00" },
  { day: "saturday", open: "08:00", close: "22:00" },
  { day: "sunday", open: "08:00", close: "22:00" },
];

interface StoreStatusState {
  isOpen: boolean;
  currentTime: string;
  nextOpenTime: string;
  nextOpenDay: string;
}

export function StoreStatus() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StoreStatusState | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Convert day (0 = Sunday) to our array index (0 = Monday)
      const dayIndex = currentDay === 0 ? 6 : currentDay - 1;
      const todayHours = STORE_HOURS[dayIndex];

      const [openHour, openMinute] = todayHours.open.split(":").map(Number);
      const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);

      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;

      const isOpen =
        currentTimeInMinutes >= openTimeInMinutes &&
        currentTimeInMinutes < closeTimeInMinutes;

      let nextOpenTime = "";
      let nextOpenDay = "";

      if (!isOpen) {
        if (currentTimeInMinutes < openTimeInMinutes) {
          // Toko belum buka hari ini
          nextOpenTime = todayHours.open;
          nextOpenDay = t(`day.${todayHours.day}`);
        } else {
          // Toko sudah tutup hari ini, cari hari berikutnya
          const searchDay = (dayIndex + 1) % 7;
          nextOpenDay = t(`day.${STORE_HOURS[searchDay].day}`);
          nextOpenTime = STORE_HOURS[searchDay].open;
        }
      }

      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      setStatus({
        isOpen,
        currentTime: currentTimeStr,
        nextOpenTime,
        nextOpenDay,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update setiap menit

    return () => clearInterval(interval);
  }, [t]);

  if (!status) return null;

  return (
    <div
      className={`w-full py-4 px-4 sm:px-6 lg:px-8 ${
        status.isOpen
          ? "bg-green-50 border-b border-green-200"
          : "bg-red-50 border-b border-red-200"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {status.isOpen ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Toko sedang buka • {status.currentTime}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                Toko sedang tutup • Buka kembali {status.nextOpenDay} pukul{" "}
                {status.nextOpenTime}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
