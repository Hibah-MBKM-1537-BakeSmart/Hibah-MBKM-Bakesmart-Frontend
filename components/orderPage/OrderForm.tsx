"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // Import Dynamic
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog untuk Modal Peta
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, MapPin, Loader2, MapIcon } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useCart } from "@/app/contexts/CartContext";

// Import Map secara Dynamic (SSR False)
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse flex items-center justify-center">
      Memuat Peta...
    </div>
  ),
});

interface OrderFormProps {
  onDeliveryModeChange?: (mode: string) => void;
  onDeliveryFeeChange?: (fee: number) => void;
  onOrderDayChange?: (day: string) => void;
  onFormDataChange?: (formData: any) => void;
  maxDaysAhead?: number;
}

export function OrderForm({
  onDeliveryModeChange,
  onDeliveryFeeChange,
  onOrderDayChange,
  onFormDataChange,
  maxDaysAhead = 30,
}: OrderFormProps) {
  const { t } = useTranslation();
  const {
    selectedOrderDay: cartOrderDay,
    isCartLockedToDay,
    cartItems,
    weekStartDate,
    weekEndDate,
  } = useCart();

  const [formData, setFormData] = useState({
    namaPenerima: "",
    nomorTelepon: "",
    deliveryMode: "",
    orderDay: cartOrderDay || "",
    tanggalPemesanan: "",
    alamat: "",
    kodePos: "",
    catatan: "",
    latitude: "",
    longitude: "",
  });

  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // State untuk Modal Peta
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (cartOrderDay && !selectedDate) {
      const today = new Date();
      const targetDayOfWeek = getDayOfWeekFromIndonesianDay(cartOrderDay);

      if (targetDayOfWeek !== undefined) {
        const currentDayOfWeek = today.getDay();
        let daysToAdd = targetDayOfWeek - currentDayOfWeek;
        if (daysToAdd < 0) daysToAdd += 7;

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);

        setSelectedDate(targetDate);
        const dateString = format(targetDate, "yyyy-MM-dd");

        setFormData((prev) => ({
          ...prev,
          orderDay: cartOrderDay,
          tanggalPemesanan: dateString,
        }));
        onOrderDayChange?.(cartOrderDay);
      }
    }
  }, [cartOrderDay]);

  useEffect(() => {
    onFormDataChange?.(formData);
  }, [formData, onFormDataChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "deliveryMode") {
      onDeliveryModeChange?.(value);
      if (value === "pickup") {
        onDeliveryFeeChange?.(0);
        setDeliveryOptions([]);
      }
    }
    if (field === "orderDay") {
      onOrderDayChange?.(value);
    }
  };

  // --- LOGIKA ONGKIR (BERAT 1 KG FIX) ---
  const calculateDeliveryFee = async () => {
    if (!formData.latitude || !formData.longitude || cartItems.length === 0)
      return;

    setIsCalculatingDelivery(true);
    setDeliveryOptions([]);

    try {
      const totalItemsCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      // Berat total paket selalu dianggap 1000 gram (1 kg)
      const weightPerItem = Math.max(1, Math.floor(1000 / totalItemsCount));

      const itemsPayload = cartItems.map((item) => {
        const basePrice = Number.parseInt(
          item.discountPrice.replace(/\D/g, "") || "0"
        );
        const attributesPrice = item.attributesPrice || 0;
        const finalItemPrice = basePrice + attributesPrice;
        const variantInfo =
          item.selectedAttributes?.map((attr) => attr.nama_id).join(", ") || "";
        const description = variantInfo
          ? `${item.name} (${variantInfo})`
          : item.name;

        return {
          name: item.name,
          description: description,
          value: finalItemPrice,
          length: 10,
          width: 10,
          height: 5,
          weight: weightPerItem, // Berat dinamis agar total 1kg
          quantity: item.quantity,
        };
      });

      const ratesPayload = {
        origin_latitude: -7.566139,
        origin_longitude: 110.82303,
        destination_latitude: Number.parseFloat(formData.latitude),
        destination_longitude: Number.parseFloat(formData.longitude),
        couriers: "gojek,grab",
        items: itemsPayload,
      };

      const response = await fetch("/api/orders/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratesPayload),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal mengambil data ongkir");

      const pricingData = result.pricing || result.data?.pricing || [];

      if (Array.isArray(pricingData) && pricingData.length > 0) {
        const newDeliveryOptions = pricingData.map((opt: any) => ({
          service: `${opt.courier_name} - ${opt.courier_service_name}`,
          price: opt.price,
          duration: "Instant (Langsung Sampai)",
        }));
        setDeliveryOptions(newDeliveryOptions);
        onDeliveryFeeChange?.(newDeliveryOptions[0].price);
      } else {
        setDeliveryOptions([]);
        onDeliveryFeeChange?.(0);
        alert("Maaf, jangkauan Gojek/Grab tidak tersedia ke lokasi ini.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Gagal cek ongkir: ${error.message}`);
      onDeliveryFeeChange?.(0);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  // Trigger hitung ongkir saat koordinat berubah
  useEffect(() => {
    if (
      formData.deliveryMode === "delivery" &&
      formData.latitude &&
      formData.longitude
    ) {
      const timer = setTimeout(() => calculateDeliveryFee(), 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.latitude, formData.longitude, formData.deliveryMode, cartItems]);

  // Fungsi Update Lokasi dari Peta Manual
  const handleMapLocationConfirm = async (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Cari nama jalan otomatis dari koordinat baru
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        handleInputChange("alamat", data.display_name);
        handleInputChange("kodePos", data.address?.postcode || "");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Fungsi GPS Otomatis
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          handleMapLocationConfirm(latitude.toString(), longitude.toString());
        },
        (error) => {
          alert(
            "Gagal mendeteksi lokasi otomatis. Silakan gunakan fitur 'Pilih Lewat Peta'."
          );
        },
        options
      );
    } else {
      alert("Browser tidak mendukung geolocation.");
    }
  };

  // --- Helper Functions for Date ---
  const getDayLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString())
      return ` ${t("order.today")}`;
    if (date.toDateString() === tomorrow.toDateString())
      return ` ${t("order.tomorrow")}`;
    return "";
  };

  const getDayOfWeekFromIndonesianDay = (
    dayName: string
  ): number | undefined => {
    const dayMap: { [key: string]: number } = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };
    return dayMap[dayName.toLowerCase()];
  };

  const getIndonesianDayName = (date: Date): string => {
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return dayNames[date.getDay()];
  };

  const selectedDayOfWeek =
    isCartLockedToDay() && cartOrderDay
      ? getDayOfWeekFromIndonesianDay(cartOrderDay)
      : undefined;

  return (
    <div className="space-y-6">
      {/* Card Tanggal - Sama seperti sebelumnya */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037] flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Informasi Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cartOrderDay && selectedDate && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  📅 Hari pesanan:{" "}
                  <strong>
                    {cartOrderDay.charAt(0).toUpperCase() +
                      cartOrderDay.slice(1)}
                  </strong>
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Tanggal:{" "}
                  <strong>
                    {format(selectedDate, "dd MMMM yyyy", { locale: id })}
                  </strong>
                </p>
              </div>
              {weekStartDate && weekEndDate && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700">
                    ✓ Periode minggu:{" "}
                    {format(new Date(weekStartDate), "dd MMM", { locale: id })}{" "}
                    -{" "}
                    {format(new Date(weekEndDate), "dd MMM yyyy", {
                      locale: id,
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Penerima - Sama seperti sebelumnya */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037]">
            {t("order.recipientInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="namaPenerima"
              className="text-[#5D4037] font-medium"
            >
              {t("order.recipientName")}
            </Label>
            <Input
              id="namaPenerima"
              value={formData.namaPenerima}
              onChange={(e) =>
                handleInputChange("namaPenerima", e.target.value)
              }
              className="border-[#8B6F47]"
              placeholder={t("order.recipientNamePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="nomorTelepon"
              className="text-[#5D4037] font-medium"
            >
              {t("order.phoneNumber")}
            </Label>
            <Input
              id="nomorTelepon"
              type="tel"
              value={formData.nomorTelepon}
              onChange={(e) =>
                handleInputChange("nomorTelepon", e.target.value)
              }
              className="border-[#8B6F47]"
              placeholder={t("order.phoneNumberPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card Mode Pengiriman */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037]">
            {t("order.deliveryMode")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.deliveryMode}
            onValueChange={(value) => handleInputChange("deliveryMode", value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label
                htmlFor="delivery"
                className="text-[#5D4037] font-medium cursor-pointer"
              >
                {t("order.deliveryOption")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label
                htmlFor="pickup"
                className="text-[#5D4037] font-medium cursor-pointer"
              >
                {t("order.pickupOption")}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Card Alamat & Peta (Hanya Muncul Jika Delivery) */}
      {formData.deliveryMode === "delivery" && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#5D4037]">
              {t("order.deliveryAddress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TOMBOL PILIH LOKASI */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-1 flex items-center justify-center gap-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white bg-transparent"
              >
                <MapPin className="h-4 w-4" />
                {t("order.useCurrentLocation")} (GPS)
              </Button>

              <Button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#8B6F47] hover:bg-[#5D4037] text-white"
              >
                <MapIcon className="h-4 w-4" />
                Pilih Lewat Peta
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat" className="text-[#5D4037] font-medium">
                {t("order.fullAddress")}
              </Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
                className="border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037]"
                placeholder={t("order.fullAddressPlaceholder")}
                rows={3}
              />
              {!formData.latitude ? (
                <p className="text-xs text-red-500">
                  * Pilih lokasi via GPS atau Peta untuk hitung ongkir
                </p>
              ) : (
                <p className="text-xs text-green-600">
                  ✓ Lokasi terkunci: {formData.latitude}, {formData.longitude}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kodePos" className="text-[#5D4037] font-medium">
                {t("order.postalCode")}
              </Label>
              <Input
                id="kodePos"
                value={formData.kodePos}
                onChange={(e) => handleInputChange("kodePos", e.target.value)}
                className="border-[#8B6F47]"
                placeholder={t("order.postalCodePlaceholder")}
              />
            </div>

            {isCalculatingDelivery && (
              <div className="flex items-center gap-2 text-[#8B6F47] animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {t("order.calculatingDelivery")}
                </span>
              </div>
            )}

            {deliveryOptions.length > 0 && !isCalculatingDelivery && (
              <div className="space-y-2 mt-4 border-t pt-4">
                <Label className="text-[#5D4037] font-medium">
                  {t("order.selectDeliveryService")}
                </Label>
                <RadioGroup
                  defaultValue="0"
                  onValueChange={(value) => {
                    const selected = deliveryOptions[Number.parseInt(value)];
                    onDeliveryFeeChange?.(selected.price);
                  }}
                  className="space-y-2"
                >
                  {deliveryOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50"
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`delivery-${index}`}
                      />
                      <Label
                        htmlFor={`delivery-${index}`}
                        className="flex-1 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-[#5D4037]">
                            {option.service}
                          </span>
                          <p className="text-sm text-gray-500">
                            {option.duration}
                          </p>
                        </div>
                        <span className="font-semibold text-[#8B6F47]">
                          Rp {option.price.toLocaleString("id-ID")}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037]">
            {t("order.additionalNotes")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="catatan"
            value={formData.catatan}
            onChange={(e) => handleInputChange("catatan", e.target.value)}
            className="border-[#8B6F47]"
            placeholder={t("order.notesPlaceholder")}
            rows={2}
          />
        </CardContent>
      </Card>

      {/* --- MODAL PETA --- */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Pilih Lokasi Pengiriman</DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative bg-gray-100 rounded-md overflow-hidden">
            <LocationPicker
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onConfirmLocation={handleMapLocationConfirm}
              onClose={() => setShowMap(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
