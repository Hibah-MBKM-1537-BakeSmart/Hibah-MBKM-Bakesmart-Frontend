"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrderForm } from "@/components/orderPage/OrderForm";
import { OrderSummary } from "@/components/orderPage/OrderSummary";
import { PaymentMethods } from "@/components/orderPage/PaymentMethods";

export default function OrderPage() {
  const [deliveryMode, setDeliveryMode] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderDay, setOrderDay] = useState("");

  // NEW: State to store form data from OrderForm
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

  // NEW: Handler to receive form data from OrderForm
  const handleFormDataChange = (formData: typeof orderFormData) => {
    console.log("[v0] Order page - form data changed:", formData);
    setOrderFormData(formData);
  };

  console.log(
    "[v0] Order page render - deliveryMode:",
    deliveryMode,
    "deliveryFee:",
    deliveryFee,
    "orderDay:",
    orderDay
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
                onFormDataChange={handleFormDataChange} // NEW: Pass form data handler
              />
              <PaymentMethods
                formData={orderFormData} // NEW: Pass form data to PaymentMethods
              />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                deliveryMode={deliveryMode}
                deliveryFee={deliveryFee}
                orderDay={orderDay}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
