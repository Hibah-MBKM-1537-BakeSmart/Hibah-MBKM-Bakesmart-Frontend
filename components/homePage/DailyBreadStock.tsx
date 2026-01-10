"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";

// [PERUBAHAN] Ganti path impor agar konsisten dengan MenuGrid.tsx
import type { MenuItem, ApiProduct } from "@/lib/types";
import { AlertCircle, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";
import { getImageUrl } from "@/lib/utils";

// [PERUBAHAN] Tipe untuk respons API (sama seperti di MenuGrid)
interface ApiResponse {
  message: string;
  data: ApiProduct[];
}

function BreadStockCard(item: MenuItem) {
  const { t, language } = useTranslation();
  const { isStoreClosed } = useStoreClosure();
  const storeIsClosed = isStoreClosed();

  const name = language === "id" ? item.nama_id : item.nama_en;
  const description = language === "id" ? item.deskripsi_id : item.deskripsi_en;
  // For daily bread, use dailyStock instead of regular stok
  const stock = item.isDaily ? item.dailyStock || 0 : item.stok;
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  const image: string = getImageUrl(item.gambars?.[0]?.file_path);

  return (
    <Card className="overflow-hidden bg-white shadow-lg transition-shadow hover:shadow-xl">
      <div className="relative">
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>

        {/* Stock Counter
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {t("stock available") || "Stok"}
          </div> */}
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3
            className="font-serif text-lg font-bold line-clamp-1"
            style={{ color: "#5D4037" }}
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
          <div className="flex items-center gap-2">
            {!isOutOfStock && (
              <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                ✓ Tersedia
              </span>
            )}
            {isOutOfStock && (
              <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                ✗ Habis
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyBreadStock() {
  const { t } = useTranslation();
  // [PERUBAHAN] Hapus hook lama
  // const { menuItems, loading, error } = useMenuData();

  // [PERUBAHAN] Tambahkan state lokal
  const [todaysBread, setTodaysBread] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isStoreClosed } = useStoreClosure();
  const storeIsClosed = isStoreClosed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(todaysBread.length / itemsPerPage);
  const visibleProducts = todaysBread.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(todaysBread.length - itemsPerPage, prev + itemsPerPage)
    );
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < todaysBread.length;

  // [PERUBAHAN] Tambahkan useEffect untuk fetch data
  useEffect(() => {
    const fetchDailyBread = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[DailyBreadStock] Fetching products from /api/products");

        // 1. Panggil API internal
        const response = await fetch("/api/products");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // 2. Transformasi data (logika disalin dari MenuGrid)
        const allProducts: MenuItem[] = (data.data || []).map(
          (product: ApiProduct) => ({
            id: product.id,
            nama_id: product.nama_id,
            nama_en: product.nama_en,
            deskripsi_id: product.deskripsi_id || "",
            deskripsi_en: product.deskripsi_en || "",
            harga: product.harga,
            harga_diskon: product.harga_diskon || null,
            stok: product.stok || 0, // Card menggunakan stok ini
            isBestSeller: product.isBestSeller || false,
            isDaily: product.isDaily || false, // Kita akan filter berdasarkan ini
            dailyStock: product.daily_stock || 0, // Data ini ada, tapi card-nya tidak pakai
            created_at: product.created_at || "",
            updated_at: product.updated_at || "",
            gambars: (product.gambars || [])
              .filter((g): g is { id: number; file_path: string } => g !== null)
              .map((g) => ({
                ...g,
                product_id: product.id,
                created_at: "",
                updated_at: "",
              })),
            jenis: product.jenis || [],
            hari: product.hari || [],
            attributes: product.attributes || [],
            bahans: product.bahans || [],
          })
        );

        // 3. Filter HANYA untuk roti harian (isDaily) DAN yang masih ada daily_stock
        const filteredDailyBread = allProducts.filter(
          (item) => item.isDaily && (item.dailyStock || 0) > 0
        );

        console.log(
          "[DailyBreadStock] Filtered daily bread:",
          filteredDailyBread
        );
        setTodaysBread(filteredDailyBread);
      } catch (err) {
        console.error("[DailyBreadStock] Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        setTodaysBread([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyBread();
  }, []); // <-- Dependency array kosong, fetch sekali saat mount

  // [PERUBAHAN] Hapus filter lama, karena data di state 'todaysBread' sudah difilter
  // const todaysBread = menuItems.filter((item) => item.stok > 0);

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
      className={`w-full py-16 md:py-24 ${
        storeIsClosed ? "opacity-50 pointer-events-none" : ""
      }`}
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
                {t("stock todays Bread") || "Roti Hari Ini"}
              </h2>
            </div>
          </div>
        </div>

        {/* Bread Grid with Carousel */}
        {todaysBread.length > 0 ? (
          <div className="relative mb-12">
            {/* Left Arrow */}
            {canGoPrevious && (
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#5D4037" }}
                aria-label="Previous products"
                disabled={storeIsClosed}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {visibleProducts.map((bread) => (
                <BreadStockCard key={bread.id} {...bread} />
              ))}
            </div>

            {/* Right Arrow */}
            {canGoNext && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#5D4037" }}
                aria-label="Next products"
                disabled={storeIsClosed}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
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
