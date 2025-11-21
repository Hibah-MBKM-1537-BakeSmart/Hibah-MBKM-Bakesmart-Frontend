"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  QrCode,
  Eye,
  Ticket,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useVouchers } from "@/app/contexts/VouchersContext";
import { AddVoucherModal } from "@/components/adminPage/vouchersPage/AddVoucherModal";
import { EditVoucherModal } from "@/components/adminPage/vouchersPage/EditVoucherModal";
import { VoucherDetailModal } from "@/components/adminPage/vouchersPage/VoucherDetailModal";
import { QRCodeModal } from "@/components/adminPage/vouchersPage/QRCodeModal";
import { useToast } from "@/components/adminPage/Toast";

export default function VouchersPage() {
  const { vouchers, loading, error, refreshVouchers, deleteVoucher } = useVouchers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const { addToast, ToastContainer } = useToast();

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = voucher.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || voucher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteVoucher = async (
    voucherId: string,
    voucherCode: string
  ) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus voucher "${voucherCode}"?`
      )
    ) {
      try {
        await deleteVoucher(voucherId);
        addToast({
          type: "success",
          title: "Voucher berhasil dihapus!",
          message: `${voucherCode} telah dihapus dari sistem.`,
        });
      } catch (error) {
        addToast({
          type: "error",
          title: "Gagal menghapus voucher",
          message: error instanceof Error ? error.message : "Terjadi kesalahan",
        });
      }
    }
  };

  const handleViewQR = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowQRModal(true);
  };

  const handleEditVoucher = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowEditModal(true);
  };

  const handleViewDetail = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowDetailModal(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "inactive":
        return "Tidak Aktif";
      case "expired":
        return "Kadaluarsa";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Voucher</h1>
          <p className="text-gray-600">Kelola voucher diskon dan promosi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Voucher</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari kode voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="expired">Kadaluarsa</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredVouchers.length} dari {vouchers.length} voucher
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Memuat voucher...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshVouchers}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diskon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Kadaluarsa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penggunaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                            <Ticket className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {voucher.code}
                            </p>
                            <p className="text-xs text-gray-500">
                              {voucher.nama && voucher.nama !== voucher.code ? voucher.nama : `ID: ${voucher.id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {voucher.discountType === "percentage"
                            ? `${voucher.discount}%`
                            : `Rp ${voucher.discount.toLocaleString("id-ID")}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  voucher.maxUsage
                                    ? (voucher.usageCount / voucher.maxUsage) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {voucher.usageCount}
                            {voucher.maxUsage ? `/${voucher.maxUsage}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            voucher.status
                          )}`}
                        >
                          {getStatusLabel(voucher.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetail(voucher)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                            title="Lihat Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewQR(voucher)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                            title="Lihat QR Code"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditVoucher(voucher)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                            title="Edit Voucher"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteVoucher(voucher.id, voucher.code)
                            }
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                            title="Hapus Voucher"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVouchers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Voucher tidak ditemukan
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== "all"
                    ? "Coba sesuaikan pencarian atau filter Anda"
                    : "Belum ada voucher. Klik tombol Tambah Voucher untuk membuat voucher baru."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Voucher</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voucher Aktif</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter((v) => v.status === "active").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Penggunaan
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.reduce((sum, v) => sum + v.usageCount, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVoucherModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditVoucherModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVoucher(null);
        }}
        voucher={selectedVoucher}
      />

      <VoucherDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedVoucher(null);
        }}
        voucher={selectedVoucher}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedVoucher(null);
        }}
        voucher={selectedVoucher}
      />
    </div>
  );
}
