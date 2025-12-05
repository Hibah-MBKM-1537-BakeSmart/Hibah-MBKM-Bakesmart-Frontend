"use client";

import { useState, useEffect } from "react";
// Impor ini mengasumsikan file-file ini ada di struktur proyek kamu
// Kompilator di sini tidak bisa melihatnya, tapi ini seharusnya bekerja di app kamu
import { MenuCard } from "./MenuCard";
import { MenuModal } from "./MenuModal";
import { ExistingCustomizationModal } from "./ExistingCustomModal";
import { RemoveCustomizationModal } from "./RemoveCustomizationModal";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { MenuWeekRangePicker } from "./MenuWeekRangePicker";
import { DateValidationModal } from "./DateValidationModal";
// Import tipe data dari file terpusat
import type { MenuItem, ApiProduct } from "@/lib/types";

// Tipe untuk respons API yang baru
interface ApiResponse {
  message: string;
  data: ApiProduct[];
}

export function MenuGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isExistingCustomizationModalOpen,
    setIsExistingCustomizationModalOpen,
  ] = useState(false);
  const [isRemoveCustomizationModalOpen, setIsRemoveCustomizationModalOpen] =
    useState(false);
  const [isDateValidationModalOpen, setIsDateValidationModalOpen] =
    useState(false);
  const [viewMode, setViewMode] = useState<"order" | "allMenu">("allMenu");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: number; nama_id: string; nama_en: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weekStartDate, setWeekStartDate] = useState<Date | null>(null);
  const [weekEndDate, setWeekEndDate] = useState<Date | null>(null);

  const { selectedOrderDay, setSelectedOrderDay, cartItems } = useCart();
  const { t, language } = useTranslation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // [PERUBAHAN] Memanggil API internal Next.js
        console.log("[v2] Fetching products from /api/products");

        const response = await fetch("/api/products"); // <-- PERUBAHAN DI SINI

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        console.log("[v2] API Response (from /api/products):", data);

        // Transform API response to MenuItem format
        const products: MenuItem[] = (data.data || []).map(
          (product: ApiProduct) => ({
            id: product.id,
            nama_id: product.nama_id,
            nama_en: product.nama_en,
            deskripsi_id: product.deskripsi_id || "",
            deskripsi_en: product.deskripsi_en || "",
            harga: product.harga,
            harga_diskon: product.harga_diskon || null,
            stok: product.stok || 0,
            isBestSeller: product.isBestSeller || false,
            // Sesuaikan dengan data dari API (berdasarkan contoh JSON kamu)
            isDaily: product.isDaily || false,
            dailyStock: product.daily_stock || 0,
            created_at: product.created_at || "",
            updated_at: product.updated_at || "",
            gambars: (product.gambars || [])
              .filter((g): g is { id: number; file_path: string } => g !== null)
              .map((g) => ({
                ...g,
                product_id: product.id,
                created_at: "", // Sesuaikan jika ada datanya
                updated_at: "", // Sesuaikan jika ada datanya
              })),
            jenis: product.jenis || [],
            hari: product.hari || [],
            attributes: product.attributes || [],
            bahans: product.bahans || [],
          })
        );

        setMenuItems(products);

        // Extract unique categories from products
        const categoryMap = new Map<
          number,
          { id: number; nama_id: string; nama_en: string }
        >();
        products.forEach((p) => {
          p.jenis.forEach((j) => {
            if (!categoryMap.has(j.id)) {
              categoryMap.set(j.id, {
                id: j.id,
                nama_id: j.nama_id,
                nama_en: j.nama_en,
              });
            }
          });
        });
        const uniqueCategories = Array.from(categoryMap.values());

        setCategories(uniqueCategories);
        console.log("[v2] Categories extracted:", uniqueCategories);
      } catch (err) {
        console.error("[v2] Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  const menuCategories = [
    {
      id: "all",
      name: t("menuGrid.allProducts"),
      active: activeCategory === "all",
    },
    ...categories.map((cat) => ({
      id: `cat-${cat.id}`,
      name: language === "id" ? cat.nama_id : cat.nama_en,
      active: activeCategory === `cat-${cat.id}`,
    })),
  ];

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleShowExistingCustomization = (item: MenuItem) => {
    setSelectedItem(item);
    setIsExistingCustomizationModalOpen(true);
  };

  const handleShowRemoveCustomization = (item: MenuItem) => {
    setSelectedItem(item);
    setIsRemoveCustomizationModalOpen(true);
  };

  const handleAddNewCustomization = () => {
    setIsExistingCustomizationModalOpen(false);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    setIsDateValidationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseExistingCustomizationModal = () => {
    setIsExistingCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsRemoveCustomizationModalOpen(false);
    setIsDateValidationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseRemoveCustomizationModal = () => {
    setIsRemoveCustomizationModalOpen(false);
    setIsModalOpen(false);
    setIsExistingCustomizationModalOpen(false);
    setIsDateValidationModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  const handleCloseDateValidationModal = () => {
    setIsDateValidationModalOpen(false);
  };

  const handleDayFilter = (dayId: string) => {
    console.log("[MenuGrid] Day selected for order:", dayId);
    // Set the selected order day (used for cart items)
    if (dayId !== "all") {
      setSelectedOrderDay(dayId);
    }
  };

  const handleWeekDateSelect = (
    startDate: Date,
    endDate: Date,
    orderDay: string
  ) => {
    setWeekStartDate(startDate);
    setWeekEndDate(endDate);
    // Auto-select hari pertama minggu
    handleDayFilter(orderDay);
  };

  const handleViewModeChange = (mode: "order" | "allMenu") => {
    setViewMode(mode);
  };

  const handleShowDateValidation = () => {
    setIsDateValidationModalOpen(true);
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

  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) =>
          item.jenis.some((j) => `cat-${j.id}` === activeCategory)
        );

  // Filter products based on selected order day
  // Only filter when in "order" mode and a specific day is selected
  // In "allMenu" mode, show all products regardless of day
  const dayFilteredItems =
    viewMode === "allMenu" || !selectedOrderDay || selectedOrderDay === "all"
      ? filteredItems
      : filteredItems.filter((item) => {
          const availableDays = (item.hari || [])
            .filter((day) => day !== null)
            .map((day) => day.nama_id);
          return (
            availableDays.length === 0 || availableDays.includes(selectedOrderDay)
          );
        });

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-2">
          {viewMode === "order" && (
            <MenuWeekRangePicker
              onDateSelect={handleWeekDateSelect}
              selectedOrderDay={selectedOrderDay}
              onViewModeChange={handleViewModeChange}
              viewMode={viewMode}
            />
          )}

          {viewMode === "allMenu" && (
            <div className="flex justify-center py-3">
              <button
                onClick={() => handleViewModeChange("order")}
                className="px-6 py-2.5 text-base font-bold rounded-full text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #8B6F47 0%, #6B5535 100%)",
                }}
              >
                🛒 Pesan Sekarang
              </button>
            </div>
          )}

          <div className="mt-3">
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
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full whitespace-nowrap ${
                      activeCategory === category.id
                        ? "text-white shadow-lg"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-md"
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

          {selectedOrderDay &&
            selectedOrderDay !== "all" &&
            viewMode === "order" && (
              <div className="mb-2 text-center">
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {t("menuGrid.orderForDay")}{" "}
                  {selectedOrderDay.charAt(0).toUpperCase() +
                    selectedOrderDay.slice(1)}
                  {cartItems.length > 0 && (
                    <span className="ml-2 font-semibold">🔒</span>
                  )}
                </span>
              </div>
            )}
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
            {dayFilteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
                onShowExistingCustomization={handleShowExistingCustomization}
                onShowRemoveCustomization={handleShowRemoveCustomization}
                onShowDateValidation={handleShowDateValidation}
                viewMode={viewMode}
              />
            ))}
          </div>

          {dayFilteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {t("menuGrid.noProductsAvailable")}
              </p>
            </div>
          )}
        </div>
      </div>

      {!isExistingCustomizationModalOpen &&
        !isRemoveCustomizationModalOpen &&
        !isDateValidationModalOpen && (
          <MenuModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            viewMode={viewMode}
          />
        )}

      {!isModalOpen &&
        !isRemoveCustomizationModalOpen &&
        !isDateValidationModalOpen && (
          <ExistingCustomizationModal
            item={selectedItem}
            isOpen={isExistingCustomizationModalOpen}
            onClose={handleCloseExistingCustomizationModal}
            onAddNewCustomization={handleAddNewCustomization}
          />
        )}

      {!isModalOpen &&
        !isExistingCustomizationModalOpen &&
        !isDateValidationModalOpen && (
          <RemoveCustomizationModal
            item={selectedItem}
            isOpen={isRemoveCustomizationModalOpen}
            onClose={handleCloseRemoveCustomizationModal}
          />
        )}

      {isDateValidationModalOpen && (
        <DateValidationModal
          isOpen={isDateValidationModalOpen}
          onClose={handleCloseDateValidationModal}
          onSelectDate={handleCloseDateValidationModal}
        />
      )}
    </>
  );
}
