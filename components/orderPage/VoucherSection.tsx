"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ticket, X, Check, Loader2, Upload, Camera } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";

interface VoucherSectionProps {
  onVoucherApplied?: (voucherCode: string, discount: number) => void;
  onVoucherRemoved?: () => void;
  totalAmount: number;
  userId?: number;
}

export function VoucherSection({
  onVoucherApplied,
  onVoucherRemoved,
  totalAmount,
  userId,
}: VoucherSectionProps) {
  const { t } = useTranslation();
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    minPurchase?: number;
    persen?: number;
    nominal?: number;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ======================================================
  // === MODIFIKASI DIMULAI DISINI ===
  // ======================================================

  // HAPUS FUNGSI 'validateVoucher' YANG LAMA
  // const validateVoucher = async (...) => { ... }
  // Logika ini sudah dipindahkan ke /api/vouchers/validate/route.ts

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError("Masukkan kode voucher");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      // Panggil API Route Next.js kita
      const response = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherCode: voucherCode.trim(),
          amount: totalAmount,
          userId: userId || 12, // Default ke 12 jika tidak ada, sesuai request
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Tangani error dari API (misal: 404 Not Found)
        throw new Error(result.message || "Kode voucher tidak valid");
      }

      // Jika sukses (status 200)
      setAppliedVoucher({
        code: result.code,
        discount: result.discount,
        minPurchase: result.details?.minimal__pembelian || 0,
        persen: result.details?.persen,
        nominal: result.details?.nominal,
      });
      // Kirim data ke komponen parent
      onVoucherApplied?.(result.code, result.discount);
      setVoucherCode("");
      setError("");
    } catch (err) {
      // Tangani error (voucher salah, server mati, dll)
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memvalidasi voucher";
      setError(errorMessage);
      setAppliedVoucher(null); // Pastikan voucher dihapus jika ada error
      onVoucherRemoved?.(); // Beri tahu parent bahwa voucher dihapus
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (appliedVoucher) {
      // 1. Cek Minimal Pembelian
      if (
        appliedVoucher.minPurchase &&
        totalAmount < appliedVoucher.minPurchase
      ) {
        setAppliedVoucher(null);
        onVoucherRemoved?.();
        setError(
          `Voucher dihapus: Total belanja kurang dari Rp ${appliedVoucher.minPurchase.toLocaleString(
            "id-ID"
          )}`
        );
        return;
      }

      // 2. Recalculate Discount jika Persentase
      if (appliedVoucher.persen) {
        const newDiscount = (totalAmount * appliedVoucher.persen) / 100;
        // Hanya update jika ada perubahan signifikan (untuk menghindari loop)
        if (Math.abs(newDiscount - appliedVoucher.discount) > 0.01) {
          setAppliedVoucher((prev) =>
            prev ? { ...prev, discount: newDiscount } : null
          );
          onVoucherApplied?.(appliedVoucher.code, newDiscount);
        }
      }
    }
  }, [totalAmount, appliedVoucher, onVoucherRemoved, onVoucherApplied]);

  // ======================================================
  // === MODIFIKASI BERAKHIR DISINI ===
  // ======================================================

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    onVoucherRemoved?.();
    setError("");
  };

  // Fungsi-fungsi di bawah ini (handleImageUpload, handleQrScan, dll)
  // TIDAK PERLU DIUBAH.
  // Logikanya sudah benar: mereka mengisi state 'voucherCode',
  // dan 'handleApplyVoucher' akan membaca state tsb saat tombol "Terapkan" diklik.

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    setIsProcessingImage(true);
    setError("");

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = async () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              setError("Tidak dapat memproses gambar");
              setIsProcessingImage(false);
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            console.log("[v0] Processing uploaded QR code image...");

            // Logika mock untuk membaca QR code
            // Nanti Anda bisa ganti dengan library QR scanner (contoh: jsQR)
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockExtractedCode = "HEMAT50";

            // Mengisi kotak input
            setVoucherCode(mockExtractedCode);
            setIsProcessingImage(false);

            const successMsg = document.createElement("div");
            successMsg.className =
              "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
            successMsg.textContent = "QR Code berhasil dibaca dari gambar!";
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
          } catch (err) {
            console.error("[v0] Error processing QR code:", err);
            setError("Gagal membaca QR code dari gambar");
            setIsProcessingImage(false);
          }
        };

        img.onerror = () => {
          setError("Gagal memuat gambar");
          setIsProcessingImage(false);
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        setError("Gagal membaca file");
        setIsProcessingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("[v0] Error uploading image:", err);
      setError("Terjadi kesalahan saat memproses gambar");
      setIsProcessingImage(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleQrScan = async () => {
    setShowQrScanner(true);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Browser tidak mendukung akses kamera");
        setShowQrScanner(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.play();

      const scannerContainer = document.getElementById("qr-scanner-video");
      if (scannerContainer) {
        scannerContainer.innerHTML = "";
        scannerContainer.appendChild(video);
      }

      // Logika mock untuk scan QR code
      // Nanti Anda bisa ganti dengan library QR scanner
      setTimeout(() => {
        const mockScannedCode = "DISKON20";
        setVoucherCode(mockScannedCode); // Mengisi kotak input
        setShowQrScanner(false);
        setIsScanning(false);

        stream.getTracks().forEach((track) => track.stop());
      }, 3000);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera");
      setShowQrScanner(false);
      setIsScanning(false);
    }
  };

  const handleCloseScanner = () => {
    setShowQrScanner(false);
    setIsScanning(false);

    const video = document.querySelector(
      "#qr-scanner-video video"
    ) as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#5D4037] flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Voucher / Kupon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appliedVoucher ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 mb-1">
                      Voucher Diterapkan
                    </p>
                    <p className="text-sm text-green-700 font-mono font-bold">
                      {appliedVoucher.code}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Diskon:{" "}
                      <span className="font-bold">
                        {formatPrice(appliedVoucher.discount)}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveVoucher}
                  className="text-green-700 hover:text-green-900 hover:bg-green-100"
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
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 border-[#8B6F47] focus:border-[#5D4037] focus:ring-[#5D4037] font-mono"
                  disabled={isValidating || isProcessingImage}
                />
                <Button
                  onClick={handleApplyVoucher}
                  disabled={
                    isValidating || isProcessingImage || !voucherCode.trim()
                  }
                  className="bg-[#8B6F47] hover:bg-[#5D4037] text-white"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validasi...
                    </>
                  ) : (
                    "Terapkan"
                  )}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isProcessingImage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-700">
                      Memproses gambar QR code...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500">atau</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleQrScan}
                  variant="outline"
                  disabled={isProcessingImage}
                  className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white bg-transparent"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  disabled={isProcessingImage}
                  className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white bg-transparent"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload QR
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tips:</strong> Masukkan kode voucher, scan QR code,
                  atau upload gambar QR code dari galeri!
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Contoh kode: DISKON10, DISKON20, HEMAT50
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showQrScanner} onOpenChange={handleCloseScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#5D4037]">
              Scan QR Code Voucher
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              id="qr-scanner-video"
              className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
            >
              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm">Memindai QR Code...</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Arahkan kamera ke QR code voucher
                  </p>
                </div>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                📱 Pastikan QR code voucher terlihat jelas dalam frame kamera
              </p>
            </div>
            <Button
              onClick={handleCloseScanner}
              variant="outline"
              className="w-full bg-transparent"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
}
