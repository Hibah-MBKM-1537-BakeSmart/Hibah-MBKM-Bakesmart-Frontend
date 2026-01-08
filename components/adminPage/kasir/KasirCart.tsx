"use client";

import React, { useState } from "react";
import { useKasir } from "@/app/contexts/KasirContext";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  CalendarIcon,
  MapPin,
  Ticket,
  Check,
  Loader2,
  Upload,
  Banknote,
  Building,
  Smartphone,
  Printer,
} from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function KasirCart() {
  const {
    state,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    setCustomerName,
    setCustomerWhatsApp,
    setCustomerAddress,
    setVoucherCode,
    setVoucherDiscount,
    setVoucherId,
    setVoucherMinPurchase,
    setOrderDate,
    setOrderDay,
    setDeliveryMode,
    setDeliveryFee,
    setCatatan,
    setPaymentMethod,
    processPayment,
    calculateSubtotal,
    calculateTotal,
  } = useKasir();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [voucherInput, setVoucherInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Rp 0";
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const handlePrintReceipt = () => {
    // Current date and time formatting
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("id-ID");

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - ${
            state.currentTransaction?.id || "ORDER"
          }</title>
          <style>
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 5mm;
              font-size: 10pt;
              line-height: 1.4;
              width: 80mm; /* Standard thermal receipt width */
              box-sizing: border-box;
            }
            
            .receipt-header {
              text-align: center;
              margin-bottom: 5mm;
              padding-bottom: 3mm;
              border-bottom: 1px dashed #000;
            }
            
            .receipt-title {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            
            .receipt-info {
              font-size: 9pt;
              margin: 1mm 0;
            }
            
            .receipt-section {
              margin: 4mm 0;
              padding: 2mm 0;
            }
            
            .section-title {
              font-weight: bold;
              font-size: 10pt;
              margin-bottom: 2mm;
              padding-bottom: 1mm;
              border-bottom: 1px solid #000;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
              font-size: 9pt;
            }
            
            .product-item {
              margin: 2mm 0;
              padding: 1mm 0;
              border-bottom: 1px dashed #ccc;
            }
            
            .product-name {
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .product-details {
              display: flex;
              justify-content: space-between;
              font-size: 9pt;
            }
            
            .totals {
              margin-top: 3mm;
              padding-top: 2mm;
              border-top: 1px solid #000;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
              font-size: 10pt;
            }
            
            .grand-total {
              font-weight: bold;
              font-size: 12pt;
              margin-top: 2mm;
              padding-top: 2mm;
              border-top: 2px double #000;
            }
            
            .receipt-footer {
              text-align: center;
              margin-top: 5mm;
              padding-top: 3mm;
              border-top: 1px dashed #000;
              font-size: 9pt;
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">BAKESMART</div>
            <div class="receipt-info">Order #${
              state.currentTransaction?.id ||
              state.customerName?.substring(0, 3).toUpperCase() +
                Math.floor(Math.random() * 1000)
            }</div>
            <div class="receipt-info">${formattedDate}</div>
            <div class="receipt-info">${formattedTime}</div>
          </div>

          <div class="receipt-section">
            <div class="section-title">INFORMASI PESANAN</div>
            <div class="info-row">
              <span>Pelanggan:</span>
              <span>${state.customerName || "Umum"}</span>
            </div>
            <div class="info-row">
              <span>Metode:</span>
              <span>${
                state.deliveryMode === "pickup" ? "Ambil Sendiri" : "Pengiriman"
              }</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span>Selesai (Lunas)</span>
            </div>
          </div>

          <div class="receipt-section">
            <div class="section-title">DETAIL PESANAN</div>
            ${state.cart
              .map(
                (item) => `
              <div class="product-item">
                <div class="product-name">
                  ${item.product.nama_id}
                </div>
                <div class="product-details">
                  <span>
                    ${item.quantity} x ${formatPrice(
                  item.finalPrice || item.product.harga
                )}
                  </span>
                  <span>${formatPrice(
                    (item.finalPrice || item.product.harga) * item.quantity
                  )}</span>
                </div>
                ${
                  item.customizations?.length
                    ? `<div style="font-size: 8pt; font-style: italic; margin-top: 1mm;">
                        + ${item.customizations.map((c) => c.nama).join(", ")}
                       </div>`
                    : ""
                }
              </div>
            `
              )
              .join("")}

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatPrice(calculateSubtotal())}</span>
              </div>
              
              ${
                state.voucherDiscount > 0
                  ? `
              <div class="total-row">
                <span>Diskon:</span>
                <span>-${formatPrice(state.voucherDiscount)}</span>
              </div>
              `
                  : ""
              }
              
              <div class="total-row">
                <span>Ongkos Kirim:</span>
                <span>${formatPrice(state.deliveryFee)}</span>
              </div>
              
              <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>${formatPrice(lastTotal)}</span>
              </div>
              
              ${
                changeAmount > 0
                  ? `
                 <div style="margin-top: 2mm; border-top: 1px dashed #000; padding-top: 2mm;">
                  <div class="total-row">
                    <span>Tunai:</span>
                    <span>${formatPrice(lastTotal + changeAmount)}</span>
                  </div>
                  <div class="total-row">
                    <span>Kembali:</span>
                    <span>${formatPrice(changeAmount)}</span>
                  </div>
                 </div>
                  `
                  : ""
              }
            </div>
          </div>

          <div class="receipt-footer">
            <div>Terima kasih atas pesanan Anda!</div>
            <div style="margin-top: 2px;">BakeSmart - Roti Berkualitas</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      // Use setTimeout to allow content to render before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setOrderDay(getIndonesianDayName(date));
      setOrderDate(format(date, "yyyy-MM-dd"));
      setIsCalendarOpen(false); // Close calendar after selection
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) {
      setVoucherError("Masukkan kode voucher");
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError("");

    try {
      // Calculate current subtotal to send to backend for min purchase validation
      const currentSubtotal = calculateSubtotal();

      const response = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherCode: voucherInput.trim(),
          amount: currentSubtotal, // Send subtotal for minimum purchase check
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Kode voucher tidak valid");
      }

      setVoucherCode(result.code);
      setVoucherDiscount(result.discount);
      setVoucherId(result.voucherId || null);
      setVoucherMinPurchase(result.minPurchase || 0);
      setVoucherInput("");
      setVoucherError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memvalidasi voucher";
      setVoucherError(errorMessage);
      setVoucherCode("");
      setVoucherDiscount(0);
      setVoucherId(null);
      setVoucherMinPurchase(0);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setVoucherDiscount(0);
    setVoucherId(null);
    setVoucherMinPurchase(0);
    setVoucherError("");
  };

  const handlePayment = async () => {
    if (!state.customerName.trim()) {
      alert("Nama pelanggan wajib diisi!");
      return;
    }
    if (!state.customerWhatsApp.trim()) {
      alert("Nomor WhatsApp pelanggan wajib diisi!");
      return;
    }

    // Calculate change for cash payment
    const currentTotal = calculateTotal();
    const receivedAmount = parseInt(cashReceived.replace(/\D/g, "")) || 0;

    if (state.paymentMethod === "cash" && receivedAmount > 0) {
      if (receivedAmount < currentTotal) {
        alert("Uang yang diterima kurang dari total pembayaran!");
        return;
      }
      setChangeAmount(receivedAmount - currentTotal);
    } else {
      setChangeAmount(0);
    }

    setLastTotal(currentTotal);
    setProcessingPayment(true);

    try {
      const success = await processPayment();
      if (success) {
        setPaymentSuccess(true);
        // Reset cash received after successful payment
        setCashReceived("");
      } else {
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setProcessingPayment(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setPaymentSuccess(false);
    setProcessingPayment(false);
    setChangeAmount(0);
    setLastTotal(0);
  };

  const formatCashInput = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    // Format with thousand separators
    if (numericValue) {
      return parseInt(numericValue).toLocaleString("id-ID");
    }
    return "";
  };

  const subtotal = calculateSubtotal();
  const finalDeliveryFee =
    state.deliveryMode === "pickup" ? 0 : state.deliveryFee;
  const total = calculateTotal();

  const paymentMethods = [
    {
      id: "cash",
      label: "Bayar Tunai",
      description: "Bayar langsung saat pengiriman/pickup",
      icon: Banknote,
    },
    {
      id: "transfer",
      label: "Transfer Bank",
      description: "Transfer ke rekening toko",
      icon: Building,
    },
    {
      id: "gopay",
      label: "GoPay",
      description: "Pembayaran melalui GoPay",
      icon: Smartphone,
    },
    {
      id: "ovo",
      label: "OVO",
      description: "Pembayaran melalui OVO",
      icon: Smartphone,
    },
    {
      id: "dana",
      label: "DANA",
      description: "Pembayaran melalui DANA",
      icon: Smartphone,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Keranjang ({state.cart.length})
          </h2>
          {state.cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 p-1"
              title="Kosongkan keranjang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {state.cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Keranjang masih kosong</p>
            <p className="text-sm text-gray-500">
              Pilih produk untuk ditambahkan
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {state.cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {item.product.nama_id}
                      </h4>

                      {item.customizations &&
                        item.customizations.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-blue-600 font-medium">
                              Kustomisasi:
                            </p>
                            <ul className="text-xs text-gray-600 ml-2">
                              {item.customizations.map(
                                (custom, customIndex) => (
                                  <li key={customIndex}>
                                    • {custom.nama}{" "}
                                    {custom.harga_tambahan > 0 &&
                                      `(+${formatPrice(
                                        custom.harga_tambahan
                                      )})`}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {item.note && (
                        <p className="text-xs text-gray-600 italic mb-2">
                          Catatan: {item.note}
                        </p>
                      )}

                      <p className="text-orange-600 font-semibold text-sm">
                        {formatPrice(item.finalPrice || item.product.harga)}
                        {item.customizations &&
                          item.customizations.length > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (termasuk kustomisasi)
                            </span>
                          )}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.product.harga * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with Checkout Button */}
      {state.cart.length > 0 && (
        <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Estimasi</span>
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(calculateSubtotal())}
            </span>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Lanjut ke Pembayaran</span>
            <Ticket className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Detail Pembayaran
              </h2>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Tanggal Pesanan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Tanggal Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {selectedDate ? (
                          format(selectedDate, "EEEE, dd MMMM yyyy", {
                            locale: id,
                          })
                        ) : (
                          <span>Pilih tanggal pesanan</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Informasi Penerima */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Informasi Penerima
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="customerName" className="text-sm">
                      Nama Penerima <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={state.customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama penerima"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerWhatsApp" className="text-sm">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerWhatsApp"
                      type="text"
                      value={state.customerWhatsApp}
                      onChange={(e) => setCustomerWhatsApp(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="mt-1"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mode Pengiriman */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Mode Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={state.deliveryMode}
                    onValueChange={(value) => {
                      setDeliveryMode(value);
                      if (value === "pickup") {
                        setDeliveryFee(0);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label
                        htmlFor="delivery"
                        className="cursor-pointer font-normal"
                      >
                        Antar (Delivery)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label
                        htmlFor="pickup"
                        className="cursor-pointer font-normal"
                      >
                        Ambil Sendiri (Pickup)
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Alamat Pengiriman (only if delivery) */}
              {state.deliveryMode === "delivery" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Alamat Pengiriman
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={state.customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap pengiriman"
                      className="resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      * Ongkir akan dihitung sesuai jarak pengiriman
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Catatan Tambahan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Catatan Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={state.catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tambahkan catatan untuk pesanan (opsional)"
                    className="resize-none"
                    rows={2}
                  />
                </CardContent>
              </Card>

              {/* Voucher / Kupon */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Voucher / Kupon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {state.voucherCode ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 text-sm mb-1">
                              Voucher Diterapkan
                            </p>
                            <p className="text-xs text-green-700 font-mono font-bold">
                              {state.voucherCode}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Diskon:{" "}
                              <span className="font-bold">
                                {formatPrice(state.voucherDiscount)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRemoveVoucher}
                          className="text-green-700 hover:text-green-900 hover:bg-green-100 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => {
                            setVoucherInput(e.target.value.toUpperCase());
                            setVoucherError("");
                          }}
                          placeholder="Masukkan kode voucher"
                          className="flex-1 font-mono"
                          disabled={isValidatingVoucher}
                        />
                        <Button
                          onClick={handleApplyVoucher}
                          disabled={isValidatingVoucher || !voucherInput.trim()}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {isValidatingVoucher ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Validasi...
                            </>
                          ) : (
                            "Terapkan"
                          )}
                        </Button>
                      </div>

                      {voucherError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-xs text-red-600">{voucherError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metode Pembayaran */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={state.paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as any)}
                    className="space-y-2"
                  >
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            state.paymentMethod === method.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setPaymentMethod(method.id as any)}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                state.paymentMethod === method.id
                                  ? "bg-orange-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  state.paymentMethod === method.id
                                    ? "text-orange-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <Label
                                htmlFor={method.id}
                                className={`cursor-pointer font-medium text-sm ${
                                  state.paymentMethod === method.id
                                    ? "text-orange-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {method.label}
                              </Label>
                              <p className="text-xs text-gray-500">
                                {method.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Ringkasan Pesanan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {state.deliveryMode === "delivery" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ongkir:</span>
                      <span className="font-medium">
                        {formatPrice(finalDeliveryFee)}
                      </span>
                    </div>
                  )}
                  {state.voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon Voucher:</span>
                      <span className="font-medium">
                        -{formatPrice(state.voucherDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Received Input (only for cash payment) */}
              {state.paymentMethod === "cash" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Uang Diterima
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          Rp
                        </span>
                        <Input
                          type="text"
                          value={cashReceived}
                          onChange={(e) =>
                            setCashReceived(formatCashInput(e.target.value))
                          }
                          placeholder="0"
                          className="pl-10 text-lg font-semibold text-right"
                        />
                      </div>
                      {cashReceived && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Kembalian:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                (parseInt(cashReceived.replace(/\D/g, "")) ||
                                  0) >= total
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPrice(
                                Math.max(
                                  0,
                                  (parseInt(cashReceived.replace(/\D/g, "")) ||
                                    0) - total
                                )
                              )}
                            </span>
                          </div>
                          {(parseInt(cashReceived.replace(/\D/g, "")) || 0) <
                            total && (
                            <p className="text-xs text-red-500 mt-1">
                              Uang kurang Rp{" "}
                              {(
                                total -
                                (parseInt(cashReceived.replace(/\D/g, "")) || 0)
                              ).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Quick amount buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[50000, 100000, 200000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setCashReceived(amount.toLocaleString("id-ID"))
                            }
                            className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {formatPrice(amount)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setCashReceived(total.toLocaleString("id-ID"))
                        }
                        className="w-full py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                      >
                        Uang Pas ({formatPrice(total)})
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handlePayment();
                  // Note: We don't close modal here immediately, only on success (which triggers clearCart) or manual close
                  // But handlePayment sets paymentSuccess on success, which shows the success modal
                  // We might want to close checkout modal when success modal opens?
                  // Let's modify handlePayment or success flow to handle this relative to UX
                  // For now, let's leave it as is, maybe the success modal appears ON TOP of this modal?
                }}
                disabled={state.isLoading || processingPayment}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  state.isLoading || processingPayment
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {state.isLoading || processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[60] bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 text-center max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">
              Pembayaran Berhasil!
            </h3>
            <p className="text-gray-600 mb-4">
              Transaksi telah diproses dengan sukses
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Bayar:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(lastTotal)}
                </span>
              </div>
              {changeAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uang Diterima:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(lastTotal + changeAmount)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Kembalian:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(changeAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
              <button
                onClick={handleCloseSuccessModal}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
