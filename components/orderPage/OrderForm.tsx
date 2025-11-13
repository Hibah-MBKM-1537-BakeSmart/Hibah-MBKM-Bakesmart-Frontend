"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useCart } from "@/app/contexts/CartContext";

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

  useEffect(() => {
    if (cartOrderDay && !selectedDate) {
      const today = new Date();
      const targetDayOfWeek = getDayOfWeekFromIndonesianDay(cartOrderDay);

      if (targetDayOfWeek !== undefined) {
        const currentDayOfWeek = today.getDay();
        let daysToAdd = targetDayOfWeek - currentDayOfWeek;

        if (daysToAdd < 0) {
          daysToAdd += 7;
        }

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  // ======================================================
  // === LOGIKA HITUNG ONGKIR FINAL ===
  // ======================================================
  const calculateDeliveryFee = async () => {
    if (!formData.latitude || !formData.longitude || cartItems.length === 0) {
      console.warn("[OrderForm] Menunggu koordinat lokasi...");
      return;
    }

    setIsCalculatingDelivery(true);
    setDeliveryOptions([]);

    try {
      console.log("[v0] Menghitung ongkir Instant (Gojek/Grab)...");

      // 1. Mapping Items sesuai contoh JSON yang BERHASIL
      const itemsPayload = cartItems.map((item) => ({
        name: item.name,
        description: item.category || "Makanan", // Deskripsi default
        value: Number.parseInt(item.discountPrice.replace(/\D/g, "")), // Harga per item

        // Hardcode dimensi & berat sesuai contoh sukses backend
        length: 30,
        width: 15,
        height: 20,
        weight: 200, // gram

        quantity: item.quantity,
      }));

      // 2. Koordinat Toko (Origin) - Sesuai payload sukses Anda
      const STORE_LAT = -7.5644564;
      const STORE_LNG = 110.8384643;

      const ratesPayload = {
        origin_latitude: STORE_LAT,
        origin_longitude: STORE_LNG,

        destination_latitude: parseFloat(formData.latitude),
        destination_longitude: parseFloat(formData.longitude),

        // Hanya Gojek & Grab sesuai permintaan "dekat"
        couriers: "gojek,grab",
        items: itemsPayload,
      };

      console.log(
        "[v0] Payload Ongkir:",
        JSON.stringify(ratesPayload, null, 2)
      );

      const response = await fetch("/api/orders/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratesPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data ongkir");
      }

      console.log("[v0] Hasil Ongkir:", result);

      // Parsing hasil response biteship
      // Struktur biasanya result.pricing atau result.data.pricing
      const pricingData = result.pricing || result.data?.pricing || [];

      if (Array.isArray(pricingData) && pricingData.length > 0) {
        const newDeliveryOptions = pricingData.map((opt: any) => ({
          service: `${opt.courier_name} - ${opt.courier_service_name}`, // misal: Gojek - Instant
          price: opt.price,
          duration: "Instant (Langsung Sampai)",
        }));

        setDeliveryOptions(newDeliveryOptions);
        // Pilih opsi pertama otomatis
        onDeliveryFeeChange?.(newDeliveryOptions[0].price);
      } else {
        console.warn("Tidak ada layanan tersedia untuk rute ini.");
        setDeliveryOptions([]);
        onDeliveryFeeChange?.(0);
        alert(
          "Layanan Gojek/Grab tidak tersedia di lokasi ini atau toko sedang tutup."
        );
      }
    } catch (error: any) {
      console.error("Error calculating delivery fee:", error);
      alert(`Gagal cek ongkir: ${error.message}`);
      onDeliveryFeeChange?.(0);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  // Trigger cek ongkir otomatis saat koordinat berubah
  useEffect(() => {
    if (
      formData.deliveryMode === "delivery" &&
      formData.latitude &&
      formData.longitude
    ) {
      const timer = setTimeout(() => {
        calculateDeliveryFee();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData.latitude, formData.longitude, formData.deliveryMode, cartItems]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // OPSI KHUSUS: Paksa browser mencari lokasi terakurat
      const options = {
        enableHighAccuracy: true, // Wajib true agar tidak pakai IP Address
        timeout: 10000, // Tunggu 10 detik
        maximumAge: 0, // Jangan pakai cache lokasi lama
      };

      // Tampilkan status loading (opsional, bisa pakai state isCalculatingDelivery jika mau)
      console.log("[OrderForm] Mencari lokasi akurat...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          console.log(
            `[OrderForm] Lokasi Ditemukan: ${latitude}, ${longitude} (Akurasi: ${position.coords.accuracy}m)`
          );

          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();

            if (data.display_name) {
              setFormData((prev) => ({
                ...prev,
                alamat: data.display_name,
                kodePos: data.address?.postcode || "",
              }));
            }
          } catch (error) {
            console.error("Error getting address:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          let msg = t("order.locationAccessError");

          // Pesan error yang lebih jelas
          if (error.code === 1)
            msg = "Izin lokasi ditolak. Cek pengaturan browser/Windows.";
          if (error.code === 2)
            msg = "Sinyal lokasi tidak ditemukan. Pastikan Wi-Fi menyala.";
          if (error.code === 3) msg = "Waktu habis mencari lokasi.";

          alert(msg);
        },
        options // <--- PENTING: Masukkan options di sini
      );
    } else {
      alert(t("order.geolocationNotSupported"));
    }
  };

  const getDayLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return ` ${t("order.today")}`;
    if (isTomorrow) return ` ${t("order.tomorrow")}`;
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
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037] flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t("order.selectOrderDate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="orderDay" className="text-[#5D4037] font-medium">
              {t("order.orderDate")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-[#8B6F47] bg-transparent"
                >
                  {selectedDate ? (
                    format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id }) +
                    getDayLabel(selectedDate)
                  ) : (
                    <span>{t("order.selectDatePlaceholder")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  selectedDayOfWeek={selectedDayOfWeek}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setSelectedDate(date);
                      const dayName = getIndonesianDayName(date);
                      const dateString = format(date, "yyyy-MM-dd");

                      handleInputChange("orderDay", dayName);
                      handleInputChange("tanggalPemesanan", dateString);
                    }
                  }}
                  disabled={(date: Date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const maxDate = new Date(today);
                    maxDate.setDate(today.getDate() + maxDaysAhead);
                    return date < today || date > maxDate;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formData.orderDay && selectedDate && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  {t("order.orderSelectedFor")}{" "}
                  <span className="font-semibold">
                    {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              type="text"
              value={formData.namaPenerima}
              onChange={(e) =>
                handleInputChange("namaPenerima", e.target.value)
              }
              className="border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037]"
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
              className="border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037]"
              placeholder={t("order.phoneNumberPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

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

      {formData.deliveryMode === "delivery" && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#5D4037]">
              {t("order.deliveryAddress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white bg-transparent"
              >
                <MapPin className="h-4 w-4" />
                {t("order.useCurrentLocation")}
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
              {!formData.latitude && (
                <p className="text-xs text-red-500">
                  * Klik "Gunakan Lokasi Saat Ini" untuk menghitung ongkir
                  Gojek/Grab
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kodePos" className="text-[#5D4037] font-medium">
                {t("order.postalCode")}
              </Label>
              <Input
                id="kodePos"
                type="text"
                value={formData.kodePos}
                onChange={(e) => handleInputChange("kodePos", e.target.value)}
                className="border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037]"
                placeholder={t("order.postalCodePlaceholder")}
              />
            </div>

            {isCalculatingDelivery && (
              <div className="flex items-center gap-2 text-[#8B6F47]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {t("order.calculatingDelivery")}
                </span>
              </div>
            )}

            {deliveryOptions.length > 0 && !isCalculatingDelivery && (
              <div className="space-y-2">
                <Label className="text-[#5D4037] font-medium">
                  {t("order.selectDeliveryService")}
                </Label>
                <RadioGroup
                  defaultValue="0"
                  onValueChange={(value) => {
                    const selectedOption =
                      deliveryOptions[Number.parseInt(value)];
                    onDeliveryFeeChange?.(selectedOption.price);
                  }}
                  className="space-y-2"
                >
                  {deliveryOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 border rounded-lg"
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`delivery-${index}`}
                      />
                      <Label
                        htmlFor={`delivery-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
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
                        </div>
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
          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-[#5D4037] font-medium">
              {t("order.notesOptional")}
            </Label>
            <Textarea
              id="catatan"
              value={formData.catatan}
              onChange={(e) => handleInputChange("catatan", e.target.value)}
              className="border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037]"
              placeholder={t("order.notesPlaceholder")}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
