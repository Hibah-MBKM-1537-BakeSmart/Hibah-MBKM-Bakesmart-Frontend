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
  const { selectedOrderDay: cartOrderDay, isCartLockedToDay } = useCart();

  const [formData, setFormData] = useState({
    namaPenerima: "",
    nomorTelepon: "",
    deliveryMode: "",
    orderDay: cartOrderDay || "",
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
        setFormData((prev) => ({ ...prev, orderDay: cartOrderDay }));
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
      }
    }

    if (field === "orderDay") {
      onOrderDayChange?.(value);
    }
  };

  const calculateDeliveryFee = async () => {
    if (!formData.alamat || !formData.kodePos) return;

    setIsCalculatingDelivery(true);
    try {
      console.log("[v0] Calculating delivery fee...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockDeliveryOptions = [
        { service: "Regular", price: 15000, duration: "2-3 hari" },
        { service: "Express", price: 25000, duration: "1-2 hari" },
        { service: "Same Day", price: 35000, duration: "Hari ini" },
      ];

      console.log("[v0] Delivery options loaded:", mockDeliveryOptions);
      setDeliveryOptions(mockDeliveryOptions);
      console.log(
        "[v0] Setting default delivery fee:",
        mockDeliveryOptions[0].price
      );
      onDeliveryFeeChange?.(mockDeliveryOptions[0].price);
    } catch (error) {
      console.error("Error calculating delivery fee:", error);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  useEffect(() => {
    if (
      formData.deliveryMode === "delivery" &&
      formData.alamat &&
      formData.kodePos
    ) {
      const timer = setTimeout(() => {
        calculateDeliveryFee();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.alamat, formData.kodePos, formData.deliveryMode]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
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
          alert(t("order.locationAccessError"));
        }
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
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
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
                      handleInputChange("orderDay", dayName);
                      console.log(
                        "[v0] Date selected:",
                        date,
                        "Day name:",
                        dayName
                      );
                    }
                  }}
                  disabled={(date: Date) => {
                    const today = new Date();
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
                    {getDayLabel(selectedDate)}
                  </span>
                  {isCartLockedToDay() && cartOrderDay && (
                    <span className="block text-xs mt-1 text-blue-600">
                      Pesanan untuk hari:{" "}
                      {cartOrderDay.charAt(0).toUpperCase() +
                        cartOrderDay.slice(1)}
                    </span>
                  )}
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
                    console.log(
                      "[v0] Delivery option selected:",
                      selectedOption
                    );
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
