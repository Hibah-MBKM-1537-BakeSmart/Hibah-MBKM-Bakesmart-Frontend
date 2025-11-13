"use client";
import { X, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

interface VoucherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: any;
}

export function VoucherDetailModal({
  isOpen,
  onClose,
  voucher,
}: VoucherDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (voucher) {
      navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !voucher) return null;

  const discountText =
    voucher.discountType === "percentage"
      ? `${voucher.discount}%`
      : `Rp ${voucher.discount.toLocaleString("id-ID")}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Voucher</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Voucher Code */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Kode Voucher</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-orange-50 border-2 border-orange-300 rounded-lg px-4 py-3">
                <p className="text-lg font-bold text-orange-600">
                  {voucher.code}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Discount Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jumlah Diskon</p>
              <p className="text-lg font-bold text-gray-900">{discountText}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipe Diskon</p>
              <p className="text-lg font-bold text-gray-900">
                {voucher.discountType === "percentage"
                  ? "Persentase"
                  : "Jumlah Tetap"}
              </p>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Tanggal Kadaluarsa</p>
            <p className="text-lg font-bold text-gray-900">
              {new Date(voucher.expiryDate).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Usage Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Penggunaan</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Digunakan</span>
                <span className="font-bold text-gray-900">
                  {voucher.usageCount}
                </span>
              </div>
              {voucher.maxUsage && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Maksimal</span>
                    <span className="font-bold text-gray-900">
                      {voucher.maxUsage}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (voucher.usageCount / voucher.maxUsage) * 100
                        }%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                voucher.status === "active"
                  ? "bg-green-100 text-green-800"
                  : voucher.status === "inactive"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {voucher.status === "active"
                ? "Aktif"
                : voucher.status === "inactive"
                ? "Tidak Aktif"
                : "Kadaluarsa"}
            </span>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <p>
              Dibuat pada:{" "}
              {new Date(voucher.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>
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
