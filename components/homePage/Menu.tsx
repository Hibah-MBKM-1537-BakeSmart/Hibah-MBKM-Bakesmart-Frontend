"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/app/contexts/TranslationContext";
// [PERUBAHAN] Hapus impor useMenuData
// import { useMenuData } from "@/app/hooks/useMenuData";
import { useCart } from "@/app/contexts/CartContext";
import { MenuModal } from "@/components/menuPage/MenuModal";
import { ExistingCustomizationModal } from "@/components/menuPage/ExistingCustomModal";
import { RemoveCustomizationModal } from "@/components/menuPage/RemoveCustomizationModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
// [PERUBAHAN] Impor tipe yang konsisten dengan komponen lain
import type { MenuItem, ApiProduct } from "@/lib/types";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";

const menuData = {
  hero: {
    backgroundImage: "/delicious-bread-and-pastries-on-wooden-table-with-.jpg",
  },
};

// [PERUBAHAN] Tipe untuk respons API (sama seperti di MenuGrid)
interface ApiResponse {
  message: string;
  data: ApiProduct[];
}

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
  const { isStoreClosed } = useStoreClosure();
  const storeIsClosed = isStoreClosed();
  const carouselRef = useRef<HTMLDivElement>(null);

  // [PERUBAHAN] Hapus hook useMenuData
  // const { menuItems, categories, loading, error } = useMenuData({
  //   category: activeCategory,
  // });

  // [PERUBAHAN] Tambahkan state lokal untuk data, loading, dan error
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // Akan menyimpan SEMUA item
  const [categories, setCategories] = useState<
    Array<{ id: number; nama_id: string; nama_en: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // [PERUBAHAN] Tambahkan useEffect untuk fetch data
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[Menu] Fetching products from /api/products");

        const response = await fetch("/api/products");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // Transformasi data (logika disalin dari MenuGrid)
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
        setMenuItems(products); // <-- Simpan SEMUA produk

        // Ekstraksi kategori (logika disalin dari MenuGrid)
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
        setCategories(uniqueCategories); // <-- Simpan SEMUA kategori

        console.log("[Menu] Data fetched and processed.");
      } catch (err) {
        console.error("[Menu] Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []); // <-- Dependency array kosong, fetch sekali saat mount

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
    // 'categories' dari state sekarang digunakan di sini
    ...categories
      .filter((cat) => cat.id !== 0)
      .map((cat) => ({
        id: cat.nama_id.toLowerCase().replace(/ /g, "-"),
        name: language === "id" ? cat.nama_id : cat.nama_en,
        active: activeCategory === cat.nama_id.toLowerCase().replace(/ /g, "-"),
      })),
  ];

  // [PERUBAHAN] Logika filtering sekarang terjadi di sini
  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) =>
          item.jenis.some(
            (j) => j.nama_id.toLowerCase().replace(/ /g, "-") === activeCategory
          )
        );

  const itemsPerView = 4;
  // [PERUBAHAN] Gunakan 'filteredItems' untuk kalkulasi carousel
  const maxIndex = Math.max(
    0,
    Math.ceil(filteredItems.length / itemsPerView) - 1
  );

  const handlePrevious = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeCategory]);

  // [PERUBAHAN] Gunakan 'filteredItems' untuk menentukan item yang terlihat
  const visibleItems = filteredItems.slice(
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
      // Objek ini HARUS sesuai dengan tipe Omit<CartItem, "quantity" | "cartId">
      const itemToAdd = {
        id: item.id,
        name: language === "id" ? item.nama_id : item.nama_en,
        discountPrice:
          item.harga_diskon && item.harga_diskon < item.harga
            ? `Rp ${item.harga_diskon.toLocaleString("id-ID")}`
            : `Rp ${item.harga.toLocaleString("id-ID")}`,
        originalPrice:
          item.harga_diskon && item.harga_diskon < item.harga
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
        orderDay: item.hari[0]?.nama_id || "Senin", // CartContext akan menimpa ini jika hari sudah dipilih
        selectedAttributes: [],
        note: "", // Asumsi 'note' adalah bagian dari tipe CartItem
      };

      // Kirim objek yang sudah bersih
      addToCart(itemToAdd);
    }
  };

  // ... (Sisa handler modal tetap sama) ...
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
    // ... (JSX Loading state tidak berubah) ...
    return (
      <section className="w-full">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          {/* ... Hero content ... */}
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
    // ... (JSX Error state tidak berubah) ...
    return (
      <section className="w-full">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          {/* ... Hero content ... */}
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

  // ... (JSX Render state) ...
  return (
    <section className="w-full">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* ... Hero content ... */}
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
                {/* menuCategories dirender dari state 'categories' */}
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      !storeIsClosed && setActiveCategory(category.id)
                    }
                    className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === category.id
                        ? "bg-[#8B6F47] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    } ${storeIsClosed ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={storeIsClosed}
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
                disabled={storeIsClosed}
              >
                <ChevronLeft
                  className={`w-6 h-6 ${
                    storeIsClosed ? "text-gray-400" : "text-gray-700"
                  }`}
                />
              </button>
            )}

            <div ref={carouselRef} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* [PERUBAHAN] Render 'visibleItems' */}
                {visibleItems.map((item) => {
                  const quantity = getItemQuantityInCart(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                        storeIsClosed
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                      onClick={() => !storeIsClosed && handleItemClick(item)}
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
                            {/* [FIX] Tampilkan harga diskon jika ada */}
                            {item.harga_diskon &&
                            item.harga_diskon < item.harga ? (
                              <>
                                <span className="text-red-600">
                                  Rp{item.harga_diskon.toLocaleString("id-ID")}
                                </span>
                                <span className="text-sm line-through text-gray-500 ml-2">
                                  Rp{item.harga.toLocaleString("id-ID")}
                                </span>
                              </>
                            ) : (
                              `Rp${item.harga.toLocaleString("id-ID")}`
                            )}
                          </span>
                          <Button
                            onClick={(e) =>
                              !storeIsClosed && handleQuickAdd(item, e)
                            }
                            disabled={storeIsClosed}
                            className={`text-white px-4 py-2 text-sm ${
                              storeIsClosed
                                ? "opacity-50 cursor-not-allowed bg-gray-400"
                                : "bg-[#5D4037] hover:bg-[#4E342E]"
                            }`}
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

            {/* [PERUBAHAN] Gunakan 'maxIndex' */}
            {carouselIndex < maxIndex && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Next"
                disabled={storeIsClosed}
              >
                <ChevronRight
                  className={`w-6 h-6 ${
                    storeIsClosed ? "text-gray-400" : "text-gray-700"
                  }`}
                />
              </button>
            )}
          </div>

          {/* [PERUBAHAN] Gunakan 'filteredItems' untuk cek
          jika tidak ada produk */}
          {filteredItems.length === 0 && (
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
              className={`border-2 px-8 py-3 text-base font-medium hover:bg-[#8B6F47] hover:text-white transition-colors bg-transparent ${
                storeIsClosed
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
              style={{
                borderColor: "#8B6F47",
                color: "#8B6F47",
              }}
              disabled={storeIsClosed}
            >
              <Link href={storeIsClosed ? "#" : "/menu"}>
                {t("menu.viewAll")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ... (Modal JSX tidak berubah) ... */}
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
