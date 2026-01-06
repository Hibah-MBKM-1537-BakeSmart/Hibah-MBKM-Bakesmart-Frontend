"use client";

import type React from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useState, useEffect, useRef } from "react";
import { getImageUrl } from "@/lib/utils";

import type { MenuItem } from "@/lib/types";

interface MenuCardProps {
  item: MenuItem;
  onClick: () => void;
  onShowExistingCustomization?: (item: MenuItem, cartItem: any) => void;
  onShowRemoveCustomization: (item: MenuItem, cartItem: any) => void;
  onShowDateValidation?: () => void;
  viewMode?: "order" | "allMenu";
}

export function MenuCard({
  item,
  onClick,
  onShowExistingCustomization,
  onShowRemoveCustomization,
  onShowDateValidation,
  viewMode = "order",
}: MenuCardProps) {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    selectedOrderDay,
    canAddToCart,
  } = useCart();
  const { isStoreClosed } = useStoreClosure();
  const { t, language } = useTranslation();

  const name = language === "id" ? item.nama_id : item.nama_en;
  const description = language === "id" ? item.deskripsi_id : item.deskripsi_en;
  const isDiscount =
    item.harga_diskon !== null && item.harga_diskon < item.harga;
  const discountPrice = isDiscount
    ? `Rp ${item.harga_diskon?.toLocaleString("id-ID") ?? "0"}`
    : `Rp ${item.harga?.toLocaleString("id-ID") ?? "0"}`;
  const originalPrice = isDiscount
    ? `Rp ${item.harga?.toLocaleString("id-ID") ?? "0"}`
    : undefined;
  const image = getImageUrl(item.gambars?.[0]?.file_path);
  // Extract the raw day names in Indonesian (nama_id) since the cart uses Indonesian day names
  const availableDays = (item.hari || [])
    .filter((day) => day !== null)
    .map((day) => day.nama_id);
  const category =
    (item.jenis || []).filter((jenis) => jenis !== null).length > 0
      ? language === "id"
        ? item.jenis[0].nama_id
        : item.jenis[0].nama_en
      : "";
  const stock = item.stok;
  const attributes = item.attributes.map((attr) => ({
    id: attr.id,
    name: language === "id" ? attr.nama_id : attr.nama_en,
    additionalPrice: attr.harga,
  }));

  // Calculate total quantity for this product across all customizations
  const totalQuantity = cartItems
    .filter((cartItem) => cartItem.id === item.id)
    .reduce((total, cartItem) => total + cartItem.quantity, 0);

  const hasItemInCart = totalQuantity > 0;

  // State untuk animasi quantity
  const [animatingQuantity, setAnimatingQuantity] = useState(false);
  const [previousQuantity, setPreviousQuantity] = useState(totalQuantity);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // Function untuk trigger animasi secara manual
  const triggerQuantityAnimation = () => {
    // Clear timeout sebelumnya jika ada
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimatingQuantity(true);
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingQuantity(false);
      animationTimeoutRef.current = null;
    }, 600);
  };

  // Effect untuk trigger animasi ketika quantity berubah
  useEffect(() => {
    if (totalQuantity !== previousQuantity) {
      // Jika quantity bertambah, trigger animasi
      if (totalQuantity > previousQuantity && totalQuantity > 0) {
        triggerQuantityAnimation();
      }
      setPreviousQuantity(totalQuantity);
    }
  }, [totalQuantity, previousQuantity]);

  // Cleanup timeout saat component unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const validation = canAddToCart({
    id: item.id,
    name: name,
    discountPrice: discountPrice,
    originalPrice: originalPrice,
    isDiscount: isDiscount,
    image: image,
    category: category,
    stock: stock,
    availableDays: availableDays,
    orderDay: selectedOrderDay || "",
  });

  const handleAddItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🟢 MenuCard: handleAddItem called for:", name);
    console.log(
      "🟢 Cart has items:",
      hasItemInCart,
      "- Total qty:",
      totalQuantity
    );

    if (isStoreClosed()) {
      alert(
        t("menu.storeIsClosed") || "Toko sedang tutup. Silakan coba lagi nanti."
      );
      return;
    }

    if (!selectedOrderDay) {
      console.log(
        "🟢 MenuCard: No date selected, showing date validation modal"
      );
      onShowDateValidation?.();
      return;
    }

    // Validasi apakah produk tersedia di hari yang dipilih
    if (selectedOrderDay && !availableDays.includes(selectedOrderDay)) {
      alert(
        `Produk ini tidak tersedia untuk hari ${selectedOrderDay}. Silakan pilih produk lain atau ubah hari pesanan.`
      );
      return;
    }

    // Jika item memiliki attributes, selalu buka modal untuk customization
    if (attributes && attributes.length > 0) {
      if (hasItemInCart) {
        console.log(
          "🟢 MenuCard: Item exists in cart, showing existing customization modal"
        );
        const existingCartItem = cartItems.find(
          (cartItem) =>
            cartItem.id === item.id && cartItem.orderDay === selectedOrderDay
        );

        if (existingCartItem) {
          onShowExistingCustomization?.(item, existingCartItem);
        } else {
          onClick();
        }
        return;
      }
      console.log("🟢 MenuCard: Opening customization modal for new item");
      onClick();
      return;
    }

    // Untuk produk tanpa attributes, langsung add ke cart
    console.log("🟢 MenuCard: Direct add to cart (no attributes)");
    addToCart({
      id: item.id,
      name: name,
      discountPrice: discountPrice,
      originalPrice: originalPrice,
      isDiscount: isDiscount,
      image: image,
      category: category,
      stock: stock,
      availableDays: availableDays,
      orderDay: selectedOrderDay || "",
      selectedAttributes: [],
    });
  };

  const handleRemoveItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🔴 MenuCard: handleRemoveItem called for:", name);

    // For products with attributes, show REMOVE customization modal
    if (attributes && attributes.length > 0) {
      // Find existing item in cart
      const existingCartItem = cartItems.find(
        (cartItem) =>
          cartItem.id === item.id && cartItem.orderDay === selectedOrderDay
      );

      if (existingCartItem) {
        console.log("🔴 MenuCard: Calling onShowRemoveCustomization");
        onShowRemoveCustomization(item, existingCartItem);
      }
      return;
    }

    // For products without attributes, directly decrease quantity
    console.log("🔴 MenuCard: Direct quantity decrease (no attributes)");
    const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (cartItem) {
      updateQuantity(cartItem.cartId, cartItem.quantity - 1);
    }
  };

  const shouldShowDiscount = isDiscount && originalPrice;
  const basePrice = Number.parseInt(discountPrice.replace(/\D/g, ""));
  const formattedPrice = `Rp${basePrice.toLocaleString("id-ID")}`;

  return (
    <div
      className={`bg-white border-b border-gray-100 p-4 md:p-6 cursor-pointer transition-all duration-300 ${
        isDisabled || isStoreClosed() ? "opacity-50" : ""
      }`}
      style={{
        backgroundColor: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(139,111,71,0.1)";
        e.currentTarget.style.backgroundColor = "#fafaf9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        e.currentTarget.style.backgroundColor = "white";
      }}
      onClick={onClick}
    >
      <div className="flex gap-4 md:gap-6">
        {/* Image Section - Left Side */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover"
            />
            {(stock <= 0 || isStoreClosed()) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {isStoreClosed()
                    ? t("menu.storeIsClosed")
                    : t("menu.outOfStock")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 text-base md:text-lg lg:text-xl line-clamp-2">
                {name}
              </h3>
              {stock > 0 && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                  Stok: {stock}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {availableDays.map((day) => (
                <span
                  key={day}
                  className={`text-xs px-2 py-0.5 rounded ${
                    selectedOrderDay === day
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t(`day.${day.toLowerCase()}`)}
                </span>
              ))}
            </div>

            {description && (
              <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed pr-4 md:pr-8">
                {description}
              </p>
            )}

            {attributes && attributes.length > 0 && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  ✨ {attributes.length} pilihan tambahan tersedia
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 md:hidden mt-2">
              {shouldShowDiscount && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {originalPrice}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formattedPrice}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                    Promo
                  </span>
                </>
              )}
              {!shouldShowDiscount && (
                <span className="text-lg font-semibold text-gray-900">
                  {formattedPrice}
                </span>
              )}
            </div>
          </div>

          {/* Order buttons for order mode */}
          {viewMode === "order" && (
            <div className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
              <div className="flex flex-col items-end">
                {shouldShowDiscount && (
                  <>
                    <span className="text-sm lg:text-base text-gray-400 line-through">
                      {originalPrice}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl lg:text-2xl font-semibold text-gray-900">
                        {formattedPrice}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded">
                        Promo
                      </span>
                    </div>
                  </>
                )}
                {!shouldShowDiscount && (
                  <span className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {formattedPrice}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center">
                  {totalQuantity === 0 ? (
                    <button
                      className={`px-6 py-2.5 lg:px-8 lg:py-3 text-base font-medium rounded-full text-white transition-all duration-200 ${
                        isDisabled || isStoreClosed()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "hover:opacity-90 hover:scale-105 active:scale-95"
                      }`}
                      style={{
                        backgroundColor:
                          isDisabled || isStoreClosed() ? undefined : "#8b6f47",
                      }}
                      onClick={handleAddItem}
                      disabled={isDisabled || isStoreClosed()}
                      title={
                        !validation.canAdd
                          ? validation.reason
                          : isStoreClosed()
                          ? "Toko sedang tutup"
                          : undefined
                      }
                    >
                      {isStoreClosed()
                        ? t("menu.storeIsClosed")
                        : stock <= 0
                        ? t("menu.outOfStock")
                        : "Tambah"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 hover:opacity-90 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                        style={{ borderColor: "#8b6f47", color: "#8b6f47" }}
                        onClick={handleRemoveItem}
                        disabled={isStoreClosed()}
                      >
                        <Minus size={20} className="lg:w-6 lg:h-6" />
                      </button>
                      <span
                        className={`text-xl lg:text-2xl font-semibold text-gray-900 min-w-[2rem] text-center transition-all duration-300 ${
                          animatingQuantity
                            ? "animate-bounce text-green-600 scale-125"
                            : ""
                        }`}
                      >
                        {totalQuantity}
                      </span>
                      <button
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          totalQuantity >= stock || isStoreClosed()
                            ? "border-gray-400 text-gray-400 cursor-not-allowed"
                            : "hover:opacity-90 hover:scale-110 active:scale-95"
                        }`}
                        style={{
                          borderColor:
                            totalQuantity >= stock || isStoreClosed()
                              ? undefined
                              : "#8b6f47",
                          color:
                            totalQuantity >= stock || isStoreClosed()
                              ? undefined
                              : "#8b6f47",
                        }}
                        onClick={handleAddItem}
                        disabled={totalQuantity >= stock || isStoreClosed()}
                      >
                        <Plus size={20} className="lg:w-6 lg:h-6" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile view - order buttons */}
          {viewMode === "order" && (
            <div className="flex flex-col items-end md:hidden gap-2">
              <div className="flex items-center justify-end">
                {totalQuantity === 0 ? (
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-full text-white transition-all duration-200 ${
                      isDisabled || isStoreClosed()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "hover:opacity-90 hover:scale-105 active:scale-95"
                    }`}
                    style={{
                      backgroundColor:
                        isDisabled || isStoreClosed() ? undefined : "#8b6f47",
                    }}
                    onClick={handleAddItem}
                    disabled={isDisabled || isStoreClosed()}
                    title={
                      !validation.canAdd
                        ? validation.reason
                        : isStoreClosed()
                        ? "Toko sedang tutup"
                        : undefined
                    }
                  >
                    {isStoreClosed()
                      ? t("menu.storeIsClosed")
                      : stock <= 0
                      ? t("menu.outOfStock")
                      : "Tambah"}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      className="w-8 h-8 rounded-full border-2 hover:opacity-90 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                      style={{ borderColor: "#8b6f47", color: "#8b6f47" }}
                      onClick={handleRemoveItem}
                      disabled={isStoreClosed()}
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      className={`text-lg font-semibold text-gray-900 min-w-[2rem] text-center transition-all duration-300 ${
                        animatingQuantity
                          ? "animate-bounce text-green-600 scale-125"
                          : ""
                      }`}
                    >
                      {totalQuantity}
                    </span>
                    <button
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        totalQuantity >= stock || isStoreClosed()
                          ? "border-gray-400 text-gray-400 cursor-not-allowed"
                          : "hover:opacity-90 hover:scale-110 active:scale-95"
                      }`}
                      style={{
                        borderColor:
                          totalQuantity >= stock || isStoreClosed()
                            ? undefined
                            : "#8b6f47",
                        color:
                          totalQuantity >= stock || isStoreClosed()
                            ? undefined
                            : "#8b6f47",
                      }}
                      onClick={handleAddItem}
                      disabled={totalQuantity >= stock || isStoreClosed()}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show price only in allMenu mode without order buttons */}
          {viewMode === "allMenu" && (
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-shrink-0">
              <div className="flex flex-col items-end">
                {shouldShowDiscount && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {originalPrice}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl lg:text-2xl font-semibold text-gray-900">
                        {formattedPrice}
                      </span>
                      <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded">
                        Promo
                      </span>
                    </div>
                  </>
                )}
                {!shouldShowDiscount && (
                  <span className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {formattedPrice}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
