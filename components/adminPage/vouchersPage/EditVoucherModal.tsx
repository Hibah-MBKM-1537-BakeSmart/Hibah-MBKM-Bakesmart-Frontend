"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useVouchers } from "@/app/contexts/VouchersContext";
import { useToast } from "@/components/adminPage/Toast";

interface EditVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: any;
}

export function EditVoucherModal({
  isOpen,
  onClose,
  voucher,
}: EditVoucherModalProps) {
  const { updateVoucher } = useVouchers();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "percentage" as "percentage" | "fixed",
    expiryDate: "",
    maxUsage: "",
    status: "active" as "active" | "inactive" | "expired",
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code,
        discount: voucher.discount.toString(),
        discountType: voucher.discountType,
        expiryDate: voucher.expiryDate,
        maxUsage: voucher.maxUsage ? voucher.maxUsage.toString() : "",
        status: voucher.status,
      });
    }
  }, [voucher, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discount || !formData.expiryDate) {
      addToast({
        type: "error",
        title: "Validasi Gagal",
        message: "Silakan isi semua kolom yang diperlukan",
      });
      return;
    }

    try {
      await updateVoucher(voucher.id, {
        code: formData.code.toUpperCase(),
        discount: Number.parseInt(formData.discount),
        discountType: formData.discountType,
        expiryDate: formData.expiryDate,
        maxUsage: formData.maxUsage ? Number.parseInt(formData.maxUsage) : null,
        status: formData.status,
      });

      addToast({
        type: "success",
        title: "Voucher Berhasil Diperbarui",
        message: `Voucher ${formData.code} telah diperbarui`,
      });

      onClose();
    } catch (error) {
      addToast({
        type: "error",
        title: "Gagal Memperbarui Voucher",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  if (!isOpen || !voucher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Voucher</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Voucher Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Voucher
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Diskon
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountType: e.target.value as "percentage" | "fixed",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Jumlah Tetap (Rp)</option>
            </select>
          </div>

          {/* Discount Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Diskon
            </label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kadaluarsa
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Max Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penggunaan Maksimal (Opsional)
            </label>
            <input
              type="number"
              value={formData.maxUsage}
              onChange={(e) =>
                setFormData({ ...formData, maxUsage: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="expired">Kadaluarsa</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
