"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  ShoppingBag,
  AlertTriangle,
  Calendar,
  Edit2,
} from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { EditCustomizationModal } from "@/components/menuPage/EditCustomizationModal";
import type { MenuItem } from "@/lib/api/mockData";
import { useMenuData } from "@/app/hooks/useMenuData";
import Link from "next/link";
import { useState } from "react";

interface OrderSummaryProps {
  deliveryMode?: string;
  deliveryFee?: number;
  orderDay?: string;
}

export function OrderSummary({
  deliveryMode = "",
  deliveryFee = 0,
  orderDay = "",
}: OrderSummaryProps) {
  const {
    cartItems,
    updateQuantity,
    getTotalPrice,
    getTotalSavings,
    selectedOrderDay,
    removeFromCart,
  } = useCart();
  const { t } = useTranslation();

  // Use the useMenuData hook to get menu items
  const { menuItems } = useMenuData();

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCartItem, setEditingCartItem] = useState<any>(null);

  const subtotal = getTotalPrice();
  const savings = getTotalSavings();
  const tax = subtotal * 0.1; // 10% tax

  const finalDeliveryFee = deliveryMode === "pickup" ? 0 : deliveryFee;
  const total = subtotal + tax + finalDeliveryFee;

  const currentOrderDay = orderDay || selectedOrderDay || "";

  const validateCartForOrderDay = () => {
    if (!currentOrderDay || cartItems.length === 0)
      return { isValid: true, invalidItems: [] };

    const invalidItems = cartItems.filter(
      (item) =>
        !item.availableDays || !item.availableDays.includes(currentOrderDay)
    );

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    };
  };

  const { isValid: isCartValid, invalidItems } = validateCartForOrderDay();

  const handleRemoveInvalidItems = () => {
    invalidItems.forEach((item) => {
      removeFromCart(item.cartId);
    });
  };

  const handleEditItem = (cartItem: any) => {
    // Use menuItems from useMenuData hook to get the menu data
    const originalProduct = menuItems.find(
      (product: MenuItem) => product.id === cartItem.id
    );

    if (!originalProduct) {
      console.error("Original product not found for ID:", cartItem.id);
      return;
    }

    // Use attributes from original product, not from cart selectedAttributes
    const mockItem = {
      id: cartItem.id,
      name: cartItem.name,
      discountPrice: cartItem.discountPrice,
      originalPrice: cartItem.originalPrice,
      isDiscount: cartItem.isDiscount,
      image: cartItem.image,
      category: cartItem.category,
      description: originalProduct.description || "",
      ingredients: originalProduct.ingredients || "",
      notes: originalProduct.notes || "",
      stock: cartItem.stock,
      availableDays: cartItem.availableDays,
      attributes: originalProduct.attributes || [],
    };

    console.log("Original product attributes:", originalProduct.attributes);
    console.log("Cart item selected attributes:", cartItem.selectedAttributes);

    setEditingItem(mockItem);
    setEditingCartItem(cartItem);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditingCartItem(null);
  };

  const getCartItemKey = (item: any) => {
    const attributesKey =
      item.selectedAttributes
        ?.map((attr: any) => `${attr.id}-${attr.additionalPrice}`)
        .sort()
        .join(",") || "no-attributes";
    return `${item.id}-${attributesKey}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDayLabel = (day: string) => {
    const dayKey = `day.${day}`;
    return t(dayKey) || day;
  };

  console.log(
    "[v0] OrderSummary render - deliveryMode:",
    deliveryMode,
    "deliveryFee:",
    deliveryFee,
    "finalDeliveryFee:",
    finalDeliveryFee,
    "orderDay prop:",
    orderDay,
    "selectedOrderDay:",
    selectedOrderDay,
    "currentOrderDay:",
    currentOrderDay
  );

  if (cartItems.length === 0) {
    return (
      <Card className="bg-white shadow-lg sticky top-24">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037]">
            {t("orderSummary.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{t("orderSummary.emptyCart")}</p>
          <p className="text-sm text-gray-400 mb-6">
            {t("orderSummary.addItemsFromMenu")}
          </p>
          <Link href="/menu">
            <Button className="bg-[#8B6F47] hover:bg-[#5D4037] text-white">
              {t("orderSummary.viewMenu")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white shadow-lg sticky top-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-[#5D4037]">
            {t("orderSummary.title")}
          </CardTitle>
          {currentOrderDay && (
            <div className="flex items-center gap-2 text-sm text-[#8B6F47] bg-[#F5F1EB] px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span>
                {t("orderSummary.orderFor")}:{" "}
                <strong>{getDayLabel(currentOrderDay)}</strong>
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {currentOrderDay && !isCartValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 mb-1">
                    {t("orderSummary.itemsNotAvailable")}{" "}
                    {getDayLabel(currentOrderDay)}
                  </p>
                  <p className="text-xs text-red-600 mb-2">
                    {t("orderSummary.itemsWillBeRemoved")}
                  </p>
                  <ul className="text-xs text-red-600 space-y-1 mb-3">
                    {invalidItems.map((item) => (
                      <li key={item.cartId} className="flex justify-between">
                        <span>• {item.name}</span>
                        <span className="text-gray-500">
                          ({t("orderSummary.available")}:{" "}
                          {item.availableDays?.join(", ") ||
                            t("orderSummary.noInfo")}
                          )
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveInvalidItems}
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                  >
                    Hapus Item Tidak Valid
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  currentOrderDay &&
                  item.availableDays &&
                  !item.availableDays.includes(currentOrderDay)
                    ? "bg-red-50 border-red-200"
                    : "bg-[#F5F1EB] border-[#E8DDD4]"
                }`}
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-[#5D4037] text-sm line-clamp-1 flex-1">
                      {item.name}
                    </h4>
                    {/* Edit Button - Show for all items that have attributes in original product */}
                    {/* {(() => {
                      const originalProduct = menuItems.find(
                        (product: MenuItem) => product.id === item.id
                      );
                      return (
                        originalProduct &&
                        originalProduct.attributes &&
                        originalProduct.attributes.length > 0
                      );
                    })() && (
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-xs text-[#8B6F47] font-medium hover:underline ml-2"
                      >
                        Edit Pesanan
                      </button>
                    )} */}
                  </div>

                  {item.availableDays && (
                    <p className="text-xs text-gray-500 mb-1 capitalize">
                      {t("orderSummary.available")}:{" "}
                      {item.availableDays.join(", ")}
                    </p>
                  )}

                  {item.selectedAttributes &&
                    item.selectedAttributes.length > 0 && (
                      <div className="text-xs text-[#8B6F47] mb-1">
                        <span className="font-medium">Add-ons: </span>
                        {item.selectedAttributes.map((attr, index) => (
                          <span key={attr.id}>
                            {attr.name} (+{formatPrice(attr.additionalPrice)})
                            {index < item.selectedAttributes!.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#8B6F47]">
                      {formatPrice(
                        Number.parseInt(item.discountPrice.replace(/\D/g, "")) +
                          (item.attributesPrice || 0)
                      )}
                    </span>
                    {item.isDiscount && item.originalPrice && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(
                            Number.parseInt(
                              item.originalPrice.replace(/\D/g, "")
                            ) + (item.attributesPrice || 0)
                          )}
                        </span>
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {t("common.discount").toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                  {item.isDiscount && item.originalPrice && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {t("orderSummary.youSave")}{" "}
                      {formatPrice(
                        Number.parseInt(item.originalPrice.replace(/\D/g, "")) -
                          Number.parseInt(item.discountPrice.replace(/\D/g, ""))
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  {/* Minus / Quantity / Plus */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item.cartId, item.quantity - 1)
                      }
                      className="h-6 w-6 p-0 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item.cartId, item.quantity + 1)
                      }
                      className="h-6 w-6 p-0 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Edit Pesanan Button */}
                  {(() => {
                    const originalProduct = menuItems.find(
                      (product: MenuItem) => product.id === item.id
                    );
                    return (
                      originalProduct &&
                      originalProduct.attributes &&
                      originalProduct.attributes.length > 0
                    );
                  })() && (
                    <button
                      onClick={() => handleEditItem(item)}
                      className="mt-1 text-xs text-[#8B6F47] font-medium hover:underline"
                    >
                      ✏️ Edit Pesanan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {savings > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700 font-medium">
                  💰 {t("orderSummary.totalDiscount")}
                </span>
                <span className="text-green-700 font-bold">
                  -{formatPrice(savings)}
                </span>
              </div>
            </div>
          )}

          <div className="border-t border-[#E8DDD4] pt-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("common.originalPrice")}</span>
              <span className="text-gray-500">
                {formatPrice(subtotal + savings)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t("orderSummary.subtotal")} ({t("common.afterDiscount")})
              </span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("orderSummary.tax")}</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t("orderSummary.deliveryFee")}
              </span>
              <span>
                {deliveryMode === "pickup" ? (
                  <span className="text-green-600 font-medium">
                    {t("orderSummary.freeDelivery")}
                  </span>
                ) : (
                  formatPrice(finalDeliveryFee)
                )}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-[#8B6F47] pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#5D4037]">
                {t("orderSummary.totalPayment")}
              </span>
              <span className="text-xl font-bold text-[#8B6F47]">
                {formatPrice(total)}
              </span>
            </div>
            {savings > 0 && (
              <div className="bg-green-100 border border-green-300 p-2 rounded-md text-center mt-3">
                <p className="text-sm text-green-700 font-medium">
                  🎉 {t("orderSummary.youSave")}{" "}
                  <span className="font-bold">{formatPrice(savings)}</span>
                </p>
              </div>
            )}
            {currentOrderDay && !isCartValid && (
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md text-center mt-3">
                <p className="text-sm text-yellow-700 font-medium">
                  ⚠️ Tidak dapat melanjutkan pemesanan. Perbaiki item yang tidak
                  sesuai terlebih dahulu.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Customization Modal */}
      <EditCustomizationModal
        item={editingItem}
        cartItem={editingCartItem}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
      />
    </>
  );
}
