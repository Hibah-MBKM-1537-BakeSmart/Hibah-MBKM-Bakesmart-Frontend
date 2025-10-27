"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/app/contexts/CartContext";
import { MenuModal } from "@/components/menuPage/MenuModal";
import { useState } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useMenuData } from "@/app/hooks/useMenuData";
import type { MenuItem } from "@/lib/api/mockData";
import { AlertCircle, Flame } from "lucide-react";

function BreadStockCard(item: MenuItem) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useTranslation();

  const name = language === "id" ? item.nama_id : item.nama_en;
  const description = language === "id" ? item.deskripsi_id : item.deskripsi_en;
  const stock = item.stok;
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  const image: string =
    item.gambars && item.gambars.length > 0
      ? item.gambars[0].file_path
      : "/placeholder.svg";

  const handleOrderClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden bg-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
        <div className="relative">
          <div className="aspect-square overflow-hidden relative cursor-pointer">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={200}
              height={200}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>

          {/* Stock Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isLowStock && (
              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {t("stock.limited") || "Terbatas"}
              </div>
            )}
            {isOutOfStock && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t("stock.outOfStock") || "Habis"}
              </div>
            )}
          </div>

          {/* Stock Counter */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {t("stock.available") || "Stok"}: {stock}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <h3
              className="font-serif text-lg font-bold cursor-pointer hover:text-[#8B6F47] transition-colors line-clamp-1"
              style={{ color: "#5D4037" }}
              onClick={() => setIsModalOpen(true)}
            >
              {name}
            </h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span
              className="font-semibold text-base"
              style={{ color: "#5D4037" }}
            >
              Rp {item.harga.toLocaleString("id-ID")}
            </span>
            <Button
              size="sm"
              className={`px-3 py-1 text-xs font-medium text-white hover:opacity-90 ${
                isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: isOutOfStock ? "#9CA3AF" : "#8B6F47" }}
              onClick={handleOrderClick}
              disabled={isOutOfStock}
              title={isOutOfStock ? t("menu.outOfStock") : t("menu.addToCart")}
            >
              {t("menu.order") || "Pesan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MenuModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export function DailyBreadStock() {
  const { t } = useTranslation();
  const { menuItems, loading, error } = useMenuData();

  // Filter items that are available today and have stock
  const todaysBread = menuItems.filter((item) => item.stok > 0);

  if (loading) {
    return (
      <section
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: "#FFF8F3" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("common.loading")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: "#FFF8F3" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t("common.retry")}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: "#FFF8F3" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Header Section */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Title */}
            <div>
              <h2
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: "#5D4037" }}
              >
                {t("stock.todaysBread") || "Roti Hari Ini"}
              </h2>
              {/* <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {t("stock.description") ||
                  "Roti segar yang baru dibuat hari ini. Pembuat roti kami sering membuat stok ekstra untuk memastikan Anda mendapatkan roti terbaik. Pesan sekarang sebelum kehabisan!"}
              </p> */}
            </div>

            {/* Info Box
            <div
              className="p-6 rounded-lg border-2"
              style={{
                backgroundColor: "#FFF8F3",
                borderColor: "#8B6F47",
              }}
            >
              <div className="flex gap-3">
                <AlertCircle
                  className="w-6 h-6 flex-shrink-0"
                  style={{ color: "#8B6F47" }}
                />
                <div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#5D4037" }}
                  >
                    {t("stock.freshBaked") || "Baru Dipanggang"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("stock.extraStock") ||
                      "Pembuat roti kami sering membuat stok ekstra untuk memenuhi permintaan. Semua roti dijamin segar dan berkualitas tinggi."}
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bread Grid */}
        {todaysBread.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {todaysBread.map((bread) => (
              <BreadStockCard key={bread.id} {...bread} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              {t("stock.noAvailable") ||
                "Tidak ada roti yang tersedia hari ini"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("stock.checkBack") ||
                "Silakan kembali lagi nanti atau hubungi kami untuk pesanan khusus"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
