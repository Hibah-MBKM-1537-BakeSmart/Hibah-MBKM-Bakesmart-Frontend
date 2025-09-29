"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { MenuModal } from "@/components/menuPage/MenuModal";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useMenuData } from "@/app/hooks/useMenuData";
import type { MenuItem } from "@/lib/api/mockData";

const menuData = {
  hero: {
    backgroundImage: "/delicious-bread-and-pastries-on-wooden-table-with-.jpg",
  },
  categories: [
    { id: "foccacia", name: "menu.categories.foccacia", active: true },
    { id: "cupcake", name: "menu.categories.cupcake", active: false },
    { id: "muffin", name: "menu.categories.muffin", active: false },
    { id: "pastries", name: "menu.categories.pastries", active: false },
    { id: "bread", name: "menu.categories.bread", active: false },
    { id: "favorite", name: "menu.categories.favorite", active: false },
  ],
};

function ProductCard(item: MenuItem) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useTranslation();

  const name = language === "id" ? item.nama_id : item.nama_en;
  const description = language === "id" ? item.deskripsi_id : item.deskripsi_en;
  const isDiscount =
    item.harga_diskon !== null && item.harga_diskon < item.harga;
  const discountPrice = isDiscount
    ? `Rp ${item.harga_diskon?.toLocaleString("id-ID")}`
    : `Rp ${item.harga.toLocaleString("id-ID")}`;
  const originalPrice = isDiscount
    ? `Rp ${item.harga.toLocaleString("id-ID")}`
    : undefined;

  const image =
    item.gambars && item.gambars.length > 0
      ? item.gambars[0].file_path
      : "/placeholder.svg";

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
        <CardContent className="p-6">
          <div className="mb-4 border-b border-gray-200 pb-2">
            <h3
              className="font-serif text-xl font-bold cursor-pointer hover:text-[#8B6F47] transition-colors"
              style={{ color: "#5D4037" }}
              onClick={() => setIsModalOpen(true)}
            >
              {name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {t("menu.availableOn")}: {availableDays.join(", ")}
            </p>
            {attributes && attributes.length > 0 && (
              <p className="text-xs text-[#8B6F47] mt-1 font-medium">
                +{attributes.length} pilihan tambahan tersedia
              </p>
            )}
          </div>
          <p className="mb-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span
                className="font-semibold text-lg"
                style={{ color: "#5D4037" }}
              >
                {discountPrice}
              </span>
              {isDiscount && originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>
            <Button
              size="sm"
              className={`px-4 py-2 text-sm font-medium text-white hover:opacity-90 ${
                isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: isOutOfStock ? "#9CA3AF" : "#8B6F47" }}
              onClick={() => setIsModalOpen(true)}
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
      />
    </>
  );
}

export function Menu() {
  const [activeCategory, setActiveCategory] = useState("foccacia");
  const { t } = useTranslation();

  const { menuItems, loading, error } = useMenuData({
    category: activeCategory,
  });

  if (loading) {
    return (
      <section className="w-full">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          <Image
            src={menuData.hero.backgroundImage || "/placeholder.svg"}
            alt="Menu hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t("menu.title")}
              </h1>
              <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed opacity-90">
                {t("bestseller.description")}
              </p>
            </div>
          </div>
        </div>

        <div
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
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          <Image
            src={menuData.hero.backgroundImage || "/placeholder.svg"}
            alt="Menu hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t("menu.title")}
              </h1>
              <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed opacity-90">
                {t("bestseller.description")}
              </p>
            </div>
          </div>
        </div>

        <div
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
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={menuData.hero.backgroundImage || "/placeholder.svg"}
          alt="Menu hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("menu.title")}
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed opacity-90">
              {t("bestseller.description")}
            </p>
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: "#F5F1EB" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="mb-12 md:mb-16">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex justify-center md:justify-center gap-2 md:gap-4 min-w-max px-4 md:px-0">
                {menuData.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                      activeCategory === category.id
                        ? "border-[#8B6F47] text-[#5D4037] font-semibold"
                        : "border-transparent text-gray-600 hover:text-[#5D4037] hover:border-[#8B6F47]/50"
                    }`}
                  >
                    {t(category.name)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {menuItems.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="md:hidden mb-12">
            <div className="overflow-x-auto scrollbar-hide">
              <div
                className="flex gap-4 pb-4"
                style={{ width: `${menuItems.length * 280}px` }}
              >
                {menuItems.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-64">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
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
              <Link href="/menu">{t("menu.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
