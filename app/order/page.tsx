"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrderForm } from "@/components/orderPage/OrderForm";
import { OrderSummary } from "@/components/orderPage/OrderSummary";
import { PaymentMethods } from "@/components/orderPage/PaymentMethods";
import { VoucherSection } from "@/components/orderPage/VoucherSection";
import { useCart } from "@/app/contexts/CartContext";

export default function OrderPage() {
  // 1. AMBIL 'getTotalPrice' DARI USECART
  const { selectedOrderDay, getTotalPrice } = useCart();

  const [deliveryMode, setDeliveryMode] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [orderDay, setOrderDay] = useState<string>(selectedOrderDay || "");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string>("");

  useEffect(() => {
    if (selectedOrderDay) {
      setOrderDay(selectedOrderDay);
    }
  }, [selectedOrderDay]);

  const [orderFormData, setOrderFormData] = useState({
    namaPenerima: "",
    nomorTelepon: "",
    deliveryMode: "",
    orderDay: "",
    alamat: "",
    kodePos: "",
    catatan: "",
    latitude: "",
    longitude: "",
  });

  const handleDeliveryFeeChange = (fee: number) => {
    console.log("[v0] Order page - delivery fee changed to:", fee);
    setDeliveryFee(fee);
  };

  const handleDeliveryModeChange = (mode: string) => {
    console.log("[v0] Order page - delivery mode changed to:", mode);
    setDeliveryMode(mode);
  };

  const handleOrderDayChange = (day: string) => {
    console.log("[v0] Order page - order day changed to:", day);
    setOrderDay(day);
  };

  const handleFormDataChange = (formData: typeof orderFormData) => {
    console.log("[v0] Order page - form data changed:", formData);
    setOrderFormData(formData);
  };

  const handleVoucherApplied = (code: string, discount: number) => {
    console.log("[v0] Voucher applied:", code, "Discount:", discount);
    setVoucherCode(code);
    setVoucherDiscount(discount);
  };

  const handleVoucherRemoved = () => {
    console.log("[v0] Voucher removed");
    setVoucherCode("");
    setVoucherDiscount(0);
  };

  // =================================================================
  // 2. LAKUKAN PERHITUNGAN GRAND TOTAL DI SINI (PARENT)
  // =================================================================
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // Pajak 10%

  // Pastikan ongkir 0 jika mode pickup
  const finalDeliveryFee = deliveryMode === "pickup" ? 0 : deliveryFee;

  // Hitung total akhir (Pastikan tidak minus)
  const grandTotal = Math.max(
    0,
    subtotal + tax + finalDeliveryFee - voucherDiscount
  );

  console.log(
    "[v0] Order page render - deliveryMode:",
    deliveryMode,
    "deliveryFee:",
    deliveryFee,
    "finalDeliveryFee:",
    finalDeliveryFee,
    "orderDay:",
    orderDay,
    "voucherDiscount:",
    voucherDiscount,
    "GRAND TOTAL:",
    grandTotal
  );

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <Navbar />

      <main className="pt-20 pb-12 px-4 md:px-12 lg:px-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5D4037] mb-2">
            Detail Pemesanan
          </h1>
          <div className="w-24 h-1 bg-[#8B6F47] mx-auto"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <OrderForm
                onDeliveryModeChange={handleDeliveryModeChange}
                onDeliveryFeeChange={handleDeliveryFeeChange}
                onOrderDayChange={handleOrderDayChange}
                onFormDataChange={handleFormDataChange}
              />
              <VoucherSection
                onVoucherApplied={handleVoucherApplied}
                onVoucherRemoved={handleVoucherRemoved}
                totalAmount={subtotal}
                userId={12} // Hardcoded user ID as per requirement
              />

              {/* 3. KIRIM HASIL HITUNGAN KE PAYMENTMETHODS */}
              <PaymentMethods
                formData={orderFormData}
                finalTotalAmount={grandTotal}
                deliveryFee={finalDeliveryFee}
                voucherCode={voucherCode}
              />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                deliveryMode={deliveryMode}
                deliveryFee={deliveryFee}
                orderDay={orderDay}
                voucherDiscount={voucherDiscount}
                voucherCode={voucherCode}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
