"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";

export function StoreClosedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpenTime, setNextOpenTime] = useState<string>("");
  const { closure } = useStoreClosure();

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();

      if (closure.isActive && closure.startDate && closure.endDate) {
        const startDate = new Date(closure.startDate);
        const endDate = new Date(closure.endDate);

        if (now >= startDate && now <= endDate) {
          setIsOpen(true);
          setNextOpenTime(`${new Date(endDate).toLocaleDateString("id-ID")}`);
          return;
        }
      }

      // Check regular operating hours
      const day = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;

      // Jam operasional: Senin-Jumat 07:00-21:00, Sabtu-Minggu 08:00-22:00
      let storeIsOpen = false;
      let nextOpen = "";

      if (day === 0) {
        // Minggu: 08:00-22:00
        if (currentTime >= 8 * 60 && currentTime < 22 * 60) {
          storeIsOpen = true;
        } else if (currentTime < 8 * 60) {
          nextOpen = "Hari ini pukul 08:00";
        } else {
          nextOpen = "Senin pukul 07:00";
        }
      } else if (day === 6) {
        // Sabtu: 08:00-22:00
        if (currentTime >= 8 * 60 && currentTime < 22 * 60) {
          storeIsOpen = true;
        } else if (currentTime < 8 * 60) {
          nextOpen = "Hari ini pukul 08:00";
        } else {
          nextOpen = "Minggu pukul 08:00";
        }
      } else if (day >= 1 && day <= 5) {
        // Senin-Jumat: 07:00-21:00
        if (currentTime >= 3 * 60 && currentTime < 21 * 60) {
          storeIsOpen = true;
        } else if (currentTime < 7 * 60) {
          nextOpen = "Hari ini pukul 07:00";
        } else {
          // Tutup setelah jam 21:00
          if (day === 5) {
            // Jumat malam, buka Sabtu pagi
            nextOpen = "Sabtu pukul 08:00";
          } else {
            // Hari biasa, buka besok pagi
            nextOpen = "Besok pukul 07:00";
          }
        }
      }

      setIsOpen(!storeIsOpen);
      setNextOpenTime(nextOpen);
    };

    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60000); // Check setiap menit

    return () => clearInterval(interval);
  }, [closure]);

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    const phoneNumber = "6212345678"; // Nomor WhatsApp dari Contact component
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
