"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useMenuData } from "@/app/hooks/useMenuData";
import { useCart } from "@/app/contexts/CartContext";
import { MenuModal } from "@/components/menuPage/MenuModal";
import { ExistingCustomizationModal } from "@/components/menuPage/ExistingCustomModal";
import { RemoveCustomizationModal } from "@/components/menuPage/RemoveCustomizationModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MenuItem } from "@/lib/api/mockData";

const menuData = {
  hero: {
    backgroundImage: "/delicious-bread-and-pastries-on-wooden-table-with-.jpg",
  },
};

export function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isExistingCustomizationModalOpen,
    setIsExistingCustomizationModalOpen,
  ] = useState(false);
  const [isRemoveCustomizationModalOpen, setIsRemoveCustomizationModalOpen] =
    useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { t, language } = useTranslation();
  const { addToCart, cartItems } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);

  const { menuItems, categories, loading, error } = useMenuData({
    category: activeCategory,
  });

  // Helper functions to replace missing context methods
  const getItemQuantityInCart = (itemId: number): number => {
    return cartItems
      .filter((cartItem) => cartItem.id === itemId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const hasCustomizations = (itemId: number): boolean => {
    return cartItems.some((cartItem) => cartItem.id === itemId);
  };

  const menuCategories = [
    {
      id: "all",
      name: t("menuGrid.allProducts"),
      active: activeCategory === "all",
    },
    ...categories
      .filter((cat) => cat.id !== 0)
      .map((cat) => ({
        id: cat.nama_id.toLowerCase().replace(/ /g, "-"),
        name: language === "id" ? cat.nama_id : cat.nama_en,
        active: activeCategory === cat.nama_id.toLowerCase().replace(/ /g, "-"),
      })),
  ];

  const itemsPerView = 4;
  const maxIndex = Math.max(0, Math.ceil(menuItems.length / itemsPerView) - 1);

  const handlePrevious = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeCategory]);

  const visibleItems = menuItems.slice(
    carouselIndex * itemsPerView,
    (carouselIndex + 1) * itemsPerView
  );

  const handleItemClick = (item: MenuItem) => {
    const itemInCart = hasCustomizations(item.id);
    if (itemInCart) {
      setSelectedItem(item);
      setIsExistingCustomizationModalOpen(true);
    } else {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if item has attributes (customizations)
    if (item.attributes && item.attributes.length > 0) {
      handleItemClick(item);
    } else {
      // Add item without customizations
      const itemToAdd = {
        id: item.id,
        name: language === "id" ? item.nama_id : item.nama_en,
        discountPrice: item.harga_diskon
          ? `Rp ${item.harga_diskon.toLocaleString("id-ID")}`
          : `Rp ${item.harga.toLocaleString("id-ID")}`,
        originalPrice: item.harga_diskon
          ? `Rp ${item.harga.toLocaleString("id-ID")}`
          : undefined,
        isDiscount: !!item.harga_diskon && item.harga_diskon < item.harga,
        image: item.gambars?.[0]?.file_path || "/placeholder.svg",
        category: item.jenis?.[0]
          ? language === "id"
            ? item.jenis[0].nama_id
            : item.jenis[0].nama_en
          : "",
        stock: item.stok,
        availableDays: item.hari.map((h) => h.nama_id),
        orderDay: item.hari[0]?.nama_id || "Senin",
        selectedAttributes: [],
      };
      addToCart(itemToAdd);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseExistingCustomizationModal = () => {
    setIsExistingCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseRemoveCustomizationModal = () => {
    setIsRemoveCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleAddNewCustomization = () => {
    setIsExistingCustomizationModalOpen(false);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 100);
  };

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
          <div className="mb-12">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 justify-center min-w-max px-2">
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === category.id
                        ? "bg-[#8B6F47] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mb-12">
            {carouselIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            <div ref={carouselRef} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleItems.map((item) => {
                  const quantity = getItemQuantityInCart(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            item.gambars?.[0]?.file_path || "/placeholder.svg"
                          }
                          alt={language === "id" ? item.nama_id : item.nama_en}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900">
                          {language === "id" ? item.nama_id : item.nama_en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {language === "id"
                            ? item.deskripsi_id
                            : item.deskripsi_en}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            Rp{item.harga.toLocaleString("id-ID")}
                          </span>
                          <Button
                            onClick={(e) => handleQuickAdd(item, e)}
                            className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 text-sm"
                          >
                            {quantity > 0
                              ? `${t("menu.inCart")} (${quantity})`
                              : t("menu.order")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {carouselIndex < maxIndex && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {t("menuGrid.noProductsAvailable")}
              </p>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 px-8 py-3 text-base font-medium hover:bg-[#8B6F47] hover:text-white transition-colors bg-transparent"
              style={{
                borderColor: "#8B6F47",
                color: "#8B6F47",
              }}
            >
              <Link href="/menu">{t("menu.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {!isExistingCustomizationModalOpen && !isRemoveCustomizationModalOpen && (
        <MenuModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {!isModalOpen && !isRemoveCustomizationModalOpen && (
        <ExistingCustomizationModal
          item={selectedItem}
          isOpen={isExistingCustomizationModalOpen}
          onClose={handleCloseExistingCustomizationModal}
          onAddNewCustomization={handleAddNewCustomization}
        />
      )}

      {!isModalOpen && !isExistingCustomizationModalOpen && (
        <RemoveCustomizationModal
          item={selectedItem}
          isOpen={isRemoveCustomizationModalOpen}
          onClose={handleCloseRemoveCustomizationModal}
        />
      )}
    </section>
  );
}
