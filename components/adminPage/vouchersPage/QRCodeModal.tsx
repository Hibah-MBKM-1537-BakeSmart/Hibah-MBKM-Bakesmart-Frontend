"use client";

import { useState, useEffect } from "react";
import { X, Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: any;
}

export function QRCodeModal({ isOpen, onClose, voucher }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && voucher) {
      setIsLoading(true);
      setError("");
      setQrDataUrl(null);

      console.log("[QRCodeModal] Generating QR for voucher code:", voucher.code);

      // Generate QR Code langsung di frontend menggunakan library qrcode
      QRCode.toDataURL(voucher.code, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
        .then((dataUrl) => {
          console.log("[QRCodeModal] QR Code generated successfully");
          setQrDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error("[QRCodeModal] QR Generation Error:", err);
          setError("Gagal membuat QR Code");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, voucher]);

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `voucher-${voucher.code}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen || !voucher) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">QR Code Voucher</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-4">
          {/* Voucher Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Kode Voucher</p>
            <p className="text-2xl font-bold text-orange-600">{voucher.code}</p>
          </div>

          {/* QR Code Display */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 w-full flex justify-center items-center min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Membuat QR Code...</p>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code ${voucher.code}`}
                className="w-full max-w-[250px] h-auto"
              />
            ) : null}
          </div>

          {/* Info */}
          <div className="w-full bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
            <p>
              {voucher.discountType === "percentage"
                ? `Diskon ${voucher.discount}%`
                : `Diskon Rp ${voucher.discount.toLocaleString("id-ID")}`}
            </p>
            <p>
              Berlaku hingga{" "}
              {new Date(voucher.expiryDate).toLocaleDateString("id-ID")}
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>
        </div>

        {/* Close Button */}
        <div className="border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
