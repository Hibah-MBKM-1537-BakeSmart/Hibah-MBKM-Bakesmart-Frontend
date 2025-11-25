"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useStoreClosure } from "@/app/contexts/StoreClosureContext";
import { ImagePopup } from "./ImagePopup";
import type { MenuItem, ProductAttribute } from "@/lib/api/mockData";

interface MenuModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  selectedOrderDay?: string | null;
}

export function MenuModal({ item, isOpen, onClose }: MenuModalProps) {
  const { t, language } = useTranslation();
  const { addToCart, cartItems, selectedOrderDay } = useCart();
  const { isStoreClosed } = useStoreClosure();
  const [tempOrderDay, setTempOrderDay] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const hasItemInCart = item
    ? cartItems.some((cartItem) => cartItem.id === item.id)
    : false;

  useEffect(() => {
    if (isOpen && item) {
      document.body.style.overflow = "hidden";
      const availableDays = item.hari.map((day) => day.nama_id);
      if (selectedOrderDay && availableDays.includes(selectedOrderDay)) {
        setTempOrderDay(selectedOrderDay);
      } else if (availableDays.length > 0) {
        setTempOrderDay(availableDays[0]);
      }
      setSelectedAttributes([]);
    } else {
      document.body.style.overflow = "unset";
      setTempOrderDay("");
      setSelectedAttributes([]);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleDaySelection = (day: string) => {
    console.log("Selected day:", day);
    console.log(
      "Available days:",
      item.hari.map((h) => h.nama_id)
    );
    setTempOrderDay(day);
  };

  const handleAttributeToggle = (attributeId: number) => {
    setSelectedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const calculateTotalPrice = () => {
    const basePrice = item.harga_diskon || item.harga;
    const attributesPrice = selectedAttributes.reduce((total, attrId) => {
      const attribute = item.attributes?.find((attr) => attr.id === attrId);
      return total + (attribute?.harga || 0);
    }, 0);
    return basePrice + attributesPrice;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    const currentStock = item?.stok || 0;
    if (newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (isStoreClosed()) {
      alert(
        t("menu.storeIsClosed") || "Toko sedang tutup. Silakan coba lagi nanti."
      );
      return;
    }

    if (!tempOrderDay) {
      alert(t("menuModal.selectDayFirst"));
      return;
    }

    const selectedAttributesData = selectedAttributes
      .map((attrId) => item.attributes?.find((attr) => attr.id === attrId))
      .filter(Boolean) as ProductAttribute[];

    const discountPrice = item.harga_diskon
      ? `Rp ${item.harga_diskon.toLocaleString("id-ID")}`
      : `Rp ${item.harga.toLocaleString("id-ID")}`;

    const originalPrice = item.harga_diskon
      ? `Rp ${item.harga.toLocaleString("id-ID")}`
      : undefined;

    // Add multiple times based on quantity
    let success = true;
    for (let i = 0; i < quantity; i++) {
      const added = addToCart({
        id: item.id,
        name: language === "id" ? item.nama_id : item.nama_en,
        discountPrice,
        originalPrice,
        isDiscount: !!item.harga_diskon && item.harga_diskon < item.harga,
        image: item.gambars?.[0]?.file_path || "/placeholder.svg",
        category: item.jenis?.[0]
          ? language === "id"
            ? item.jenis[0].nama_id
            : item.jenis[0].nama_en
          : "",
        stock: item.stok,
        availableDays: item.hari.map((h) => h.nama_id),
        orderDay: tempOrderDay,
        selectedAttributes: selectedAttributesData,
      });
      if (!added) {
        success = false;
        break;
      }
    }
    onClose();
  };

  const handleResetCustomization = () => {
    setSelectedAttributes([]);
    const availableDays = item.hari.map((day) => day.nama_id);
    setTempOrderDay(availableDays[0] || "");
  };

  const shouldShowDiscount =
    item.harga_diskon && item.harga_diskon < item.harga;
  const originalPrice = `Rp${item.harga.toLocaleString("id-ID")}`;
  const isOutOfStock = item.stok <= 0;

  const getDayLabel = (day: string) => {
    const dayLabels: { [key: string]: string } = {
      Senin: t("day.monday"),
      Selasa: t("day.tuesday"),
      Rabu: t("day.wednesday"),
      Kamis: t("day.thursday"),
      Jumat: t("day.friday"),
      Sabtu: t("day.saturday"),
      Minggu: t("day.sunday"),
    };
    return dayLabels[day] || day;
  };

  const totalPrice = calculateTotalPrice();
  const formattedTotalPrice = `Rp${totalPrice.toLocaleString("id-ID")}`;

  const availableDays = item.hari.map((day) => day.nama_id.toLowerCase());
  const hasCustomization =
    selectedAttributes.length > 0 || tempOrderDay !== availableDays[0];

  const itemName = language === "en" ? item.nama_en : item.nama_id;
  const itemImage = item.gambars?.[0]?.file_path || "/placeholder.svg";
  const itemDescription =
    language === "en" ? item.deskripsi_en : item.deskripsi_id;
  const itemIngredients =
    item.bahans
      ?.map((bahan) => (language === "en" ? bahan.nama_en : bahan.nama_id))
      .join(", ") || "Tidak ada informasi bahan";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 pointer-events-none" />

        <div
          className="bg-[#F5F1EB] rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full md:w-2/5 lg:w-1/2 relative flex-shrink-0">
            <div className="w-full h-full relative flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg md:rounded-l-lg md:rounded-tr-none min-h-[200px] md:min-h-[600px]">
              <img
                src={itemImage || "/placeholder.svg"}
                alt={itemName}
                className="w-full h-full max-w-none object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                onClick={() => setIsImagePopupOpen(true)}
              />
              {(isOutOfStock || isStoreClosed()) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                  <span className="text-white text-xl font-bold">
                    {isStoreClosed()
                      ? t("menu.storeIsClosed")
                      : t("menuModal.outOfStock")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 md:min-h-[600px]">
            {/* Header - Fixed */}
            <div className="flex justify-between items-start p-4 md:p-6 pb-3 md:pb-4 flex-shrink-0 border-b border-[#8B6F47]/10">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#5D4037] uppercase leading-tight">
                  {itemName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {!isOutOfStock && !isStoreClosed() ? (
                    <span className="text-xs md:text-sm bg-green-100 text-green-600 px-2 py-1 rounded">
                      {t("menuModal.stockAvailable")}: {item.stok}
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                      {isStoreClosed()
                        ? t("menu.storeIsClosed")
                        : t("menuModal.stockEmpty")}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#5D4037] hover:text-[#8B6F47] transition-colors ml-2 flex-shrink-0"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4 min-h-0">
              <div className="space-y-4 md:space-y-5">
                <div>
                  <h3 className="font-semibold text-[#5D4037] mb-2 md:mb-3 text-sm md:text-base">
                    {t("menuModal.selectOrderDay")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDaySelection(day)}
                        disabled={isStoreClosed()}
                        className={`px-3 py-2 md:px-4 md:py-2.5 text-sm rounded-lg font-medium transition-all duration-200 min-w-[70px] md:min-w-[80px] ${
                          tempOrderDay === day
                            ? "bg-[#5D4037] text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#8B6F47]"
                        } ${
                          isStoreClosed() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        data-day={day}
                      >
                        {getDayLabel(day)}
                      </button>
                    ))}
                  </div>
                  {!tempOrderDay && (
                    <p className="text-orange-600 text-sm mt-2 font-medium">
                      {t("menuModal.selectDayFirst")}
                    </p>
                  )}
                </div>

                {/* Attributes Selection - Only if available */}
                {item.attributes && item.attributes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[#5D4037] mb-2 text-sm md:text-base">
                      Pilihan Tambahan
                      <span className="text-xs font-normal text-gray-600 ml-2">
                        (opsional)
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {item.attributes.map((attribute) => {
                        const attributeName =
                          language === "en"
                            ? attribute.nama_en
                            : attribute.nama_id;
                        return (
                          <label
                            key={attribute.id}
                            className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-[#8B6F47] hover:shadow-sm cursor-pointer transition-all duration-200 ${
                              isStoreClosed()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedAttributes.includes(
                                  attribute.id
                                )}
                                onChange={() =>
                                  handleAttributeToggle(attribute.id)
                                }
                                disabled={isStoreClosed()}
                                className="w-4 h-4 text-[#8B6F47] border-gray-300 rounded focus:ring-[#8B6F47] focus:ring-2 flex-shrink-0"
                              />
                              <span className="text-gray-800 font-medium text-sm truncate">
                                {attributeName}
                              </span>
                            </div>
                            <span className="text-[#5D4037] font-semibold text-sm ml-2 flex-shrink-0">
                              +Rp{attribute.harga.toLocaleString("id-ID")}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#5D4037] mb-2 text-sm md:text-base">
                      {t("menuModal.description")}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {itemDescription}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#5D4037] mb-2 text-sm md:text-base">
                      {t("menuModal.ingredients")}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {itemIngredients}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 md:p-6 pt-3 md:pt-4 border-t border-[#8B6F47]/20 flex-shrink-0 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div className="flex flex-col">
                  {shouldShowDiscount ? (
                    <>
                      <span className="text-base md:text-lg text-gray-400 line-through">
                        {originalPrice}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-[#8B6F47]">
                          {formattedTotalPrice}
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs md:text-sm px-2 py-1 rounded">
                          {t("menuModal.promo")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-[#8B6F47]">
                      {formattedTotalPrice}
                    </span>
                  )}
                  {selectedAttributes.length > 0 && (
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      Termasuk {selectedAttributes.length} pilihan tambahan
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || isStoreClosed()}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        quantity <= 1 || isStoreClosed()
                          ? "bg-gray-100 text-gray-400"
                          : "bg-[#5D4037] text-white hover:bg-[#8B6F47]"
                      }`}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={
                        quantity >= (item?.stok || 0) || isStoreClosed()
                      }
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        quantity >= (item?.stok || 0) || isStoreClosed()
                          ? "bg-gray-100 text-gray-400"
                          : "bg-[#5D4037] text-white hover:bg-[#8B6F47]"
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className={`px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-medium transition-all duration-300 text-sm md:text-base w-full md:w-auto ${
                      isOutOfStock || !tempOrderDay || isStoreClosed()
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-[#5D4037] text-white hover:bg-[#8B6F47] shadow-md hover:shadow-lg"
                    }`}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || !tempOrderDay || isStoreClosed()}
                  >
                    {isStoreClosed()
                      ? t("menu.storeIsClosed")
                      : isOutOfStock
                      ? t("menuModal.stockEmpty")
                      : !tempOrderDay
                      ? t("menuModal.selectDayFirst")
                      : hasItemInCart
                      ? "Tambah Kustomisasi Baru"
                      : "Tambah ke Keranjang"}
                  </button>

                  {item.attributes &&
                    item.attributes.length > 0 &&
                    hasCustomization && (
                      <button
                        className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base border border-[#8B6F47] text-[#8B6F47] rounded-lg hover:bg-[#8B6F47] hover:text-white transition-all duration-300 w-full md:w-auto"
                        onClick={handleResetCustomization}
                        disabled={isStoreClosed()}
                      >
                        Reset Pilihan
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/5 to-black/20" />
        </div>
      </div>

      {/* Image Popup Component */}
      <ImagePopup
        src={itemImage || "/placeholder.svg"}
        alt={itemName}
        isOpen={isImagePopupOpen}
        onClose={() => setIsImagePopupOpen(false)}
      />
    </>
  );
}
