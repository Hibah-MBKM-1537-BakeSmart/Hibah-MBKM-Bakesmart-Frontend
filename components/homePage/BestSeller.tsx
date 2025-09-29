"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/app/contexts/CartContext";
import { MenuModal } from "@/components/menuPage/MenuModal";
import { useState } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useBestSellers } from "@/app/hooks/useMenuData";
import type { MenuItem } from "@/lib/api/mockData";

function ProductCard(item: MenuItem) {
  const { addToCart, selectedOrderDay } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useTranslation();

  const name = language === "id" ? item.nama_id : item.nama_en;
  const description = language === "id" ? item.deskripsi_id : item.deskripsi_en;
  const isDiscount =
    item.harga_diskon !== null && item.harga_diskon < item.harga;
  const discountPrice = isDiscount
    ? `Rp ${item.harga_diskon?.toLocaleString("id-ID")}`
    : `Rp ${item.harga.toLocaleString("id-ID")}`;
  const originalPrice: string | undefined = isDiscount
    ? `Rp ${item.harga.toLocaleString("id-ID")}`
    : undefined;

  const image: string =
    item.gambars && item.gambars.length > 0
      ? item.gambars[0].file_path
      : "/placeholder.svg"; // ✅ selalu string

  const availableDays = item.hari.map((day) =>
    language === "id" ? day.nama_id : day.nama_en
  );
  const category =
    item.jenis.length > 0
      ? language === "id"
        ? item.jenis[0].nama_id
        : item.jenis[0].nama_en
      : "";
  const ingredients = item.bahans
    .map((bahan) => (language === "id" ? bahan.nama_id : bahan.nama_en))
    .join(", ");
  const stock = item.stok;
  const attributes = item.attributes.map((attr) => ({
    id: attr.id,
    name: language === "id" ? attr.nama_id : attr.nama_en,
    additionalPrice: attr.harga,
  }));

  const isOutOfStock = stock <= 0;

  const handleOrderClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden bg-white shadow-lg transition-shadow hover:shadow-xl">
        <div
          className="aspect-square overflow-hidden relative cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          {isDiscount && originalPrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {t("menu.discount")}
            </div>
          )}
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
            <p className="text-xs text-gray-500 mt-1 capitalize line-clamp-1">
              {t("menu.availableOn")}: {availableDays.join(", ")}
            </p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description}
            </p>
            {attributes && attributes.length > 0 && (
              <p className="text-xs text-[#8B6F47] mt-1 font-medium">
                +{attributes.length} pilihan tambahan
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span
                className="font-semibold text-base"
                style={{ color: "#5D4037" }}
              >
                {discountPrice}
              </span>
              {isDiscount && originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>
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
              {t("menu.order")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MenuModal
        item={{
          id: item.id,
          name,
          discountPrice,
          originalPrice,
          isDiscount,
          image,
          category,
          description,
          ingredients,
          notes: "", // Not available in new API structure
          stock,
          availableDays,
          attributes,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedOrderDay={selectedOrderDay}
      />
    </>
  );
}

export function BestSeller() {
  const { t } = useTranslation();
  const { bestSellers, loading, error } = useBestSellers();

  if (loading) {
    return (
      <section
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: "#F5F1EB" }}
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
        style={{ backgroundColor: "#F5F1EB" }}
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
      style={{ backgroundColor: "#F5F1EB" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* --- Header Section --- */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Title */}
            <div>
              <h2
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                style={{ color: "#5D4037" }}
              >
                {t("bestseller.title")}
              </h2>
            </div>

            {/* Description */}
            <div className="lg:pt-2">
              <p className="text-gray-600 leading-relaxed text-base line-clamp-2 md:text-lg">
                {t("bestseller.description")}
              </p>
            </div>
          </div>
        </div>

        {/* --- Products Grid --- */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Mobile grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:hidden mb-12">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* --- View All Button --- */}
        <div className="flex justify-center lg:justify-end">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 px-8 py-3 text-base font-medium hover:opacity-90 bg-transparent"
            style={{
              borderColor: "#8B6F47",
              color: "#8B6F47",
              backgroundColor: "transparent",
            }}
          >
            <Link href="/menu">{t("bestseller.viewAll")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
