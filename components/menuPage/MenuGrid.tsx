"use client";

import { useState, useEffect } from "react";
import { MenuCard } from "./MenuCard";
import { MenuModal } from "./MenuModal";
import { ExistingCustomizationModal } from "./ExistingCustomModal";
import { RemoveCustomizationModal } from "./RemoveCustomizationModal";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useMenuData } from "@/app/hooks/useMenuData";
import type { MenuItem, ProductType } from "@/lib/api/mockData";

export function MenuGrid() {
  const [activeDay, setActiveDay] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isExistingCustomizationModalOpen,
    setIsExistingCustomizationModalOpen,
  ] = useState(false);
  const [isRemoveCustomizationModalOpen, setIsRemoveCustomizationModalOpen] =
    useState(false);

  const { selectedOrderDay, setSelectedOrderDay } = useCart();
  const { t, language } = useTranslation();

  const { menuItems, categories, loading, error } = useMenuData({
    category: activeCategory,
    day: activeDay,
  });

  const dayFilters = [
    { id: "all", name: t("menuGrid.allDays"), active: activeDay === "all" },
    { id: "Senin", name: t("day.monday"), active: activeDay === "Senin" },
    { id: "Selasa", name: t("day.tuesday"), active: activeDay === "Selasa" },
    { id: "Rabu", name: t("day.wednesday"), active: activeDay === "Rabu" },
    { id: "Kamis", name: t("day.thursday"), active: activeDay === "Kamis" },
    { id: "Jumat", name: t("day.friday"), active: activeDay === "Jumat" },
    { id: "Sabtu", name: t("day.saturday"), active: activeDay === "Sabtu" },
    { id: "Minggu", name: t("day.sunday"), active: activeDay === "Minggu" },
  ];

  const menuCategories = [
    {
      id: "all",
      name: t("menuGrid.allProducts"),
      active: activeCategory === "all",
    },
    ...categories
      .filter((cat) => cat.id !== 0) // Filter out the "Semua Produk" category
      .map((cat) => ({
        id: cat.nama_id.toLowerCase().replace(/ /g, "-"),
        name: language === "id" ? cat.nama_id : cat.nama_en,
        active: activeCategory === cat.nama_id.toLowerCase().replace(/ /g, "-"),
      })),
  ];

  useEffect(() => {
    if (selectedOrderDay) {
      setActiveDay(selectedOrderDay);
      console.log(
        "Updated active day from selectedOrderDay:",
        selectedOrderDay
      );
    }
  }, [selectedOrderDay]);

  // Handle klik pada menu card (untuk lihat detail atau pilih customization pertama kali)
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Handle ketika user klik tambah pada item yang sudah ada di cart dengan attributes
  const handleShowExistingCustomization = (item: MenuItem) => {
    setSelectedItem(item);
    setIsExistingCustomizationModalOpen(true);
  };

  // Handle ketika user klik minus pada item yang sudah ada di cart dengan attributes
  const handleShowRemoveCustomization = (item: MenuItem) => {
    setSelectedItem(item);
    setIsRemoveCustomizationModalOpen(true);
  };

  // Handle ketika user pilih "Tambah dengan kustomisasi baru" dari existing customization modal
  const handleAddNewCustomization = () => {
    // Tutup existing modal dulu, lalu buka menu modal dengan delay
    setIsExistingCustomizationModalOpen(false);

    // Gunakan setTimeout untuk memastikan existing modal sudah tertutup sepenuhnya
    setTimeout(() => {
      setIsModalOpen(true);
    }, 100); // Delay kecil untuk transisi yang smooth
  };

  // Close modals - pastikan semua modal tertutup
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    // Reset selectedItem dengan delay kecil
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseExistingCustomizationModal = () => {
    setIsExistingCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    // Reset selectedItem dengan delay kecil
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseRemoveCustomizationModal = () => {
    setIsRemoveCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    // Reset selectedItem dengan delay kecil
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleDayFilter = (dayId: string) => {
    console.log("Setting active day to:", dayId);
    // Keep original case for day names
    setActiveDay(dayId);
    // If this is a day selection for ordering, also update selectedOrderDay
    if (dayId !== "all") {
      setSelectedOrderDay(dayId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">
              {t("menuGrid.selectOrderDay")}
            </h3>
            {!selectedOrderDay && (
              <p className="text-xs text-orange-600 mb-2 text-center">
                {t("menuGrid.selectDayToOrder")}
              </p>
            )}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max px-2 justify-center">
                {dayFilters.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleDayFilter(day.id)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full whitespace-nowrap flex-shrink-0 ${
                      activeDay === day.id
                        ? "text-white shadow-md"
                        : "text-gray-600 hover:text-white hover:shadow-sm bg-gray-100"
                    }`}
                    style={{
                      backgroundColor:
                        activeDay === day.id ? "#5D4037" : undefined,
                    }}
                  >
                    {day.name}
                    {day.id === selectedOrderDay && day.id !== "all" && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedOrderDay && selectedOrderDay !== "all" && (
            <div className="mb-2 text-center">
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {t("menuGrid.orderForDay")}{" "}
                {selectedOrderDay.charAt(0).toUpperCase() +
                  selectedOrderDay.slice(1)}
              </span>
            </div>
          )}

          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">
              {t("menuGrid.productCategories")}
            </h3>
            <div className="overflow-x-auto pb-2">
              <div
                className="flex flex-wrap gap-2 justify-center mx-auto px-2"
                style={{
                  maxWidth: menuCategories.length <= 6 ? "fit-content" : "100%",
                  overflow: menuCategories.length <= 6 ? "visible" : "auto",
                }}
              >
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full whitespace-nowrap ${
                      activeCategory === category.id
                        ? "text-white shadow-lg"
                        : "text-gray-600 hover:text-white hover:shadow-md bg-gray-100"
                    }`}
                    style={{
                      backgroundColor:
                        activeCategory === category.id ? "#8B6F47" : undefined,
                      minWidth: "max-content",
                      flexShrink: 0,
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-0">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("menuGrid.promoSection")}
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {menuItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
                onShowExistingCustomization={handleShowExistingCustomization}
                onShowRemoveCustomization={handleShowRemoveCustomization}
              />
            ))}
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {t("menuGrid.noProductsAvailable")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Menu Modal - untuk customization pertama kali atau customization baru */}
      {!isExistingCustomizationModalOpen && !isRemoveCustomizationModalOpen && (
        <MenuModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Existing Customization Modal - untuk konfirmasi item yang sudah ada di cart */}
      {!isModalOpen && !isRemoveCustomizationModalOpen && (
        <ExistingCustomizationModal
          item={selectedItem}
          isOpen={isExistingCustomizationModalOpen}
          onClose={handleCloseExistingCustomizationModal}
          onAddNewCustomization={handleAddNewCustomization}
        />
      )}

      {/* Remove Customization Modal - untuk memilih customization yang ingin dikurangi */}
      {!isModalOpen && !isExistingCustomizationModalOpen && (
        <RemoveCustomizationModal
          item={selectedItem}
          isOpen={isRemoveCustomizationModalOpen}
          onClose={handleCloseRemoveCustomizationModal}
        />
      )}
    </>
  );
}
