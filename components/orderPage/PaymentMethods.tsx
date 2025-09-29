"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useCart } from "@/app/contexts/CartContext";

// NEW: Add interface for form data
interface FormData {
  namaPenerima: string;
  nomorTelepon: string;
  deliveryMode: string;
  orderDay: string;
  alamat: string;
  kodePos: string;
  catatan: string;
  latitude: string;
  longitude: string;
}

// UPDATED: Add formData prop
interface PaymentMethodsProps {
  formData?: FormData;
}

export function PaymentMethods({ formData }: PaymentMethodsProps) {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const { t } = useTranslation();
  const { completeOrder, cartItems, getTotalPrice } = useCart();

  const paymentOptions = [
    {
      value: "cash",
      label: t("payment.cash"),
      description: t("payment.cashDesc"),
    },
    {
      value: "transfer",
      label: t("payment.transfer"),
      description: t("payment.transferDesc"),
    },
    {
      value: "gopay",
      label: t("payment.gopay"),
      description: t("payment.gopayDesc"),
    },
    {
      value: "ovo",
      label: t("payment.ovo"),
      description: t("payment.ovoDesc"),
    },
    {
      value: "dana",
      label: t("payment.dana"),
      description: t("payment.danaDesc"),
    },
  ];

  const handleProcessOrder = async () => {
    if (!selectedPayment || cartItems.length === 0) return;

    setIsProcessing(true);

    try {
      console.log("[v0] ===== ORDER SUBMISSION DATA =====");

      // Order summary data
      const orderData = {
        orderId: `ORDER_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        paymentMethod: selectedPayment,
        paymentMethodLabel: paymentOptions.find(
          (p) => p.value === selectedPayment
        )?.label,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: getTotalPrice(),
        tax: getTotalPrice() * 0.1,
        deliveryFee: 0, // This would come from parent component
        totalAmount: getTotalPrice() + getTotalPrice() * 0.1,
        currency: "IDR",
      };

      console.log("[v0] Order Summary:", orderData);

      // UPDATED: Use real form data instead of hardcoded strings
      const customerData = {
        recipientName: formData?.namaPenerima || "Not provided",
        phoneNumber: formData?.nomorTelepon || "Not provided",
        deliveryMode: formData?.deliveryMode || "Not provided",
        orderDay: formData?.orderDay || "Not provided",
        address: formData?.alamat || "Not provided",
        postalCode: formData?.kodePos || "Not provided",
        notes: formData?.catatan || "No notes",
        coordinates: {
          latitude: formData?.latitude || "Not provided",
          longitude: formData?.longitude || "Not provided",
        },
      };

      console.log("[v0] Customer Data:", customerData);

      // Cart items with detailed breakdown
      const itemsData = cartItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        category: item.category,
        quantity: item.quantity,
        basePrice: Number.parseInt(item.discountPrice.replace(/\D/g, "")),
        originalPrice: item.originalPrice
          ? Number.parseInt(item.originalPrice.replace(/\D/g, ""))
          : null,
        isDiscounted: item.isDiscount || false,
        selectedAttributes: item.selectedAttributes || [],
        attributesPrice: item.attributesPrice || 0,
        totalItemPrice:
          (Number.parseInt(item.discountPrice.replace(/\D/g, "")) +
            (item.attributesPrice || 0)) *
          item.quantity,
        orderDay: item.orderDay,
        availableDays: item.availableDays,
        cartId: item.cartId,
        image: item.image,
      }));

      console.log("[v0] Cart Items Data:", itemsData);

      // Stock management data
      const stockUpdates = cartItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantityToDecrease: item.quantity,
        currentStock: item.stock,
        newStock: item.stock - item.quantity,
      }));

      console.log("[v0] Stock Updates Required:", stockUpdates);

      // Complete backend payload
      const backendPayload = {
        order: orderData,
        customer: customerData,
        items: itemsData,
        stockUpdates: stockUpdates,
        metadata: {
          source: "web_order_form",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          locale: "id-ID",
        },
      };

      console.log(
        "[v0] COMPLETE BACKEND PAYLOAD:",
        JSON.stringify(backendPayload, null, 2)
      );
      console.log("[v0] =====================================");

      console.log("[v0] Processing order with payment:", selectedPayment);
      console.log("[v0] Cart items:", cartItems);

      // Simulate payment processing with stages
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[v0] Payment validated...");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[v0] Stock checking...");

      // Complete order and decrease stock
      const success = completeOrder();

      if (success) {
        console.log("[v0] Order completed successfully");
        setOrderComplete(true);
        setTimeout(() => {
          alert(
            `Pesanan berhasil diproses dengan ${
              paymentOptions.find((p) => p.value === selectedPayment)?.label
            }! Stock telah diperbarui.`
          );
          setOrderComplete(false);
          setSelectedPayment("");
        }, 1000);
      } else {
        alert(
          "Gagal memproses pesanan. Stock tidak mencukupi atau terjadi kesalahan."
        );
      }
    } catch (error) {
      console.log("[v0] Order processing error:", error);
      alert("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <Card className="bg-green-50 shadow-lg border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-green-600 text-2xl mb-2">✓</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Pesanan Berhasil!
          </h3>
          <p className="text-green-700">Stock telah diperbarui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#5D4037]">
          {t("payment.title")}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Total: Rp {getTotalPrice().toLocaleString()} ({cartItems.length} item)
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedPayment}
          onValueChange={setSelectedPayment}
          className="space-y-3"
        >
          {paymentOptions.map((option) => (
            <div
              key={option.value}
              className={`flex items-start space-x-3 p-3 border rounded-lg transition-all cursor-pointer ${
                selectedPayment === option.value
                  ? "border-[#8B6F47] bg-[#F5F1EB] shadow-sm"
                  : "border-gray-200 hover:border-[#8B6F47] hover:bg-[#F5F1EB]"
              }`}
              onClick={() => setSelectedPayment(option.value)}
            >
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={option.value}
                  className="text-[#5D4037] font-medium cursor-pointer block"
                >
                  {option.label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <Button
          className="w-full bg-[#8B6F47] hover:bg-[#5D4037] text-white font-semibold py-3 mt-6 transition-colors duration-300 disabled:opacity-50"
          disabled={!selectedPayment || isProcessing || cartItems.length === 0}
          onClick={handleProcessOrder}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Memproses Pesanan...</span>
            </div>
          ) : (
            `${t(
              "payment.processOrder"
            )} - Rp ${getTotalPrice().toLocaleString()}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
