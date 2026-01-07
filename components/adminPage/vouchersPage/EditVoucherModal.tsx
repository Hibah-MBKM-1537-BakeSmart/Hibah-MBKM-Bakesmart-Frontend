"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useVouchers } from "@/app/contexts/VouchersContext";
import { useToast } from "@/app/contexts/ToastContext";

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
    nama: "",
    code: "",
    discount: "",
    expiryDate: "",
    maxUsage: "",
    maxDiscount: "",
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        nama: voucher.nama || "",
        code: voucher.kode || "",
        discount: voucher.persen ? voucher.persen.toString() : "0",
        expiryDate: voucher.tanggal_selesai || "",
        maxUsage: voucher.batas_penggunaan
          ? voucher.batas_penggunaan.toString()
          : "1",
        maxDiscount: voucher.maksimal_diskon
          ? voucher.maksimal_diskon.toString()
          : "0",
      });
    }
  }, [voucher, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discount || !formData.maxUsage) {
      addToast({
        type: "error",
        title: "Validasi Gagal",
        message: "Silakan isi kode voucher, diskon, dan penggunaan maksimal",
      });
      return;
    }

    try {
      await updateVoucher(voucher.id, {
        nama: formData.nama || `Voucher ${formData.code}`,
        kode: formData.code.toUpperCase(),
        persen: formData.discount,
        tanggal_mulai: null,
        tanggal_selesai: formData.expiryDate || null,
        batas_penggunaan: Number.parseInt(formData.maxUsage),
        maksimal_diskon: formData.maxDiscount
          ? Number.parseInt(formData.maxDiscount)
          : 0,
      } as any);

      addToast({
        type: "success",
        title: "Voucher Berhasil Di Edit",
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
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Edit Voucher</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Voucher
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Diskon (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimal Diskon (Rp)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscount: e.target.value })
                }
                placeholder="0 jika tidak ada maksimal"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penggunaan Maksimal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxUsage}
                onChange={(e) =>
                  setFormData({ ...formData, maxUsage: e.target.value })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Footer Buttons - Fixed */}
          <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
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
