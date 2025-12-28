"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";

export function StoreClosedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpenTime, setNextOpenTime] = useState<string>("");
  const { closure, config } = useStoreClosure();

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();

      // Check manual closure
      if (closure.isActive && closure.startDate && closure.endDate) {
        const startDate = new Date(closure.startDate);
        const endDate = new Date(closure.endDate);

        if (now >= startDate && now <= endDate) {
          setIsOpen(true);
          setNextOpenTime(`${new Date(endDate).toLocaleDateString("id-ID")}`);
          return;
        }
      }

      // Check if store is manually closed via backend config
      if (config.is_tutup) {
        setIsOpen(true);
        if (config.tgl_buka) {
          setNextOpenTime(
            new Date(config.tgl_buka).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        } else {
          setNextOpenTime("Akan diumumkan");
        }
        return;
      }

      // Check regular operating hours from backend config
      const day = now.getDay(); // 0=Minggu, 1=Senin, dst
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;

      // Get today's operating hours
      const todayHours = config.operating_hours?.find(
        (h) => h.day_index === day
      );

      if (todayHours) {
        // Jika hari ini toko tidak buka
        if (!todayHours.is_open) {
          setIsOpen(true);
          // Find next open day
          const nextOpenDay = findNextOpenDay(day, config.operating_hours);
          setNextOpenTime(nextOpenDay);
          return;
        }

        // Parse open and close time
        const [openH, openM] = todayHours.open_time.split(":").map(Number);
        const [closeH, closeM] = todayHours.close_time.split(":").map(Number);
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;

        // Check if current time is within operating hours
        if (currentTime < openTime) {
          // Belum buka
          setIsOpen(true);
          setNextOpenTime(`Hari ini pukul ${todayHours.open_time}`);
          return;
        } else if (currentTime >= closeTime) {
          // Sudah tutup
          setIsOpen(true);
          // Find next open day
          const nextOpenDay = findNextOpenDay(day, config.operating_hours);
          setNextOpenTime(nextOpenDay);
          return;
        }

        // Store is open
        setIsOpen(false);
        return;
      }

      // Fallback: use default operating hours if no config
      let storeIsOpen = false;
      let nextOpen = "";

      if (day === 0 || day === 6) {
        // Sabtu-Minggu: 08:00-22:00
        if (currentTime >= 8 * 60 && currentTime < 22 * 60) {
          storeIsOpen = true;
        } else if (currentTime < 8 * 60) {
          nextOpen = "Hari ini pukul 08:00";
        } else {
          nextOpen = day === 6 ? "Minggu pukul 08:00" : "Senin pukul 07:00";
        }
      } else {
        // Senin-Jumat: 07:00-21:00
        if (currentTime >= 7 * 60 && currentTime < 21 * 60) {
          storeIsOpen = true;
        } else if (currentTime < 7 * 60) {
          nextOpen = "Hari ini pukul 07:00";
        } else {
          nextOpen = day === 5 ? "Sabtu pukul 08:00" : "Besok pukul 07:00";
        }
      }

      setIsOpen(!storeIsOpen);
      setNextOpenTime(nextOpen);
    };

    // Helper function to find next open day
    const findNextOpenDay = (
      currentDay: number,
      operatingHours: typeof config.operating_hours
    ) => {
      if (!operatingHours || operatingHours.length === 0) {
        return "Besok";
      }

      for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        const nextDayHours = operatingHours.find(
          (h) => h.day_index === nextDay
        );
        if (nextDayHours?.is_open) {
          return `${nextDayHours.day_name} pukul ${nextDayHours.open_time}`;
        }
      }
      return "Akan diumumkan";
    };

    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60000); // Check setiap menit

    return () => clearInterval(interval);
  }, [closure, config]);

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    const phoneNumber = config.whatsapp_number || "6212345678"; // Use config number or fallback
    const message = "Halo, saya ingin menanyakan tentang produk Anda";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const isScheduledClosure =
    closure.isActive &&
    closure.startDate &&
    closure.endDate &&
    new Date() >= new Date(closure.startDate) &&
    new Date() <= new Date(closure.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={() => {}} />

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <div className="text-3xl">🔒</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">
            Toko Sedang Tutup
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {isScheduledClosure
              ? closure.reason
                ? `Maaf, toko kami sedang tutup. Alasan: ${closure.reason}`
                : "Maaf, toko kami sedang tutup saat ini."
              : "Maaf, toko kami sedang tutup saat ini."}
          </p>

          {/* Next open time */}
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-sm text-gray-600 mb-1">
              {isScheduledClosure ? "Buka kembali:" : "Buka kembali:"}
            </p>
            <p className="text-lg font-semibold text-red-700">{nextOpenTime}</p>
          </div>

          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Hubungi via WhatsApp
          </button>

          {/* Alternative message */}
          <p className="text-xs text-gray-500 mt-4">
            Anda masih bisa memesan untuk pengiriman di hari berikutnya
          </p>
        </div>
      </div>
    </div>
  );
}
