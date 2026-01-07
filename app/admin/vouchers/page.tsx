"use client";

import React, { useState, useMemo } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useVouchers } from "@/app/contexts/VouchersContext";
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";
import { AddVoucherModal } from "@/components/adminPage/vouchersPage/AddVoucherModal";
import { EditVoucherModal } from "@/components/adminPage/vouchersPage/EditVoucherModal";
import { VoucherDetailModal } from "@/components/adminPage/vouchersPage/VoucherDetailModal";
import { QRCodeModal } from "@/components/adminPage/vouchersPage/QRCodeModal";
import { DeleteConfirmModal } from "@/components/adminPage/vouchersPage/DeleteConfirmModal";
import { useToast } from "@/app/contexts/ToastContext";

type SortField = "code" | "discount" | "expiryDate" | "usage" | "status";
type SortDirection = "asc" | "desc" | null;

export default function VouchersPage() {
  const { vouchers, loading, error, refreshVouchers, deleteVoucher } =
    useVouchers();
  const { t } = useAdminTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [groupByAlphabet, setGroupByAlphabet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const { addToast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4 text-orange-500" />;
    }
    return <ArrowDown className="w-4 h-4 text-orange-500" />;
  };

  const filteredAndSortedVouchers = useMemo(() => {
    let result = vouchers.filter((voucher) => {
      const matchesSearch = voucher.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || voucher.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let compareValue = 0;

        switch (sortField) {
          case "code":
            compareValue = a.code.localeCompare(b.code);
            break;
          case "discount":
            compareValue = a.discount - b.discount;
            break;
          case "expiryDate":
            const dateA = new Date(a.expiryDate).getTime();
            const dateB = new Date(b.expiryDate).getTime();
            compareValue = dateA - dateB;
            break;
          case "usage":
            const usagePercentA = a.maxUsage
              ? (a.usageCount / a.maxUsage) * 100
              : a.usageCount;
            const usagePercentB = b.maxUsage
              ? (b.usageCount / b.maxUsage) * 100
              : b.usageCount;
            compareValue = usagePercentA - usagePercentB;
            break;
          case "status":
            const statusOrder = { active: 1, inactive: 2, expired: 3 };
            const statusA =
              statusOrder[a.status as keyof typeof statusOrder] || 4;
            const statusB =
              statusOrder[b.status as keyof typeof statusOrder] || 4;
            compareValue = statusA - statusB;
            break;
        }

        return sortDirection === "asc" ? compareValue : -compareValue;
      });
    }

    return result;
  }, [vouchers, searchTerm, filterStatus, sortField, sortDirection]);

  const groupedVouchers = useMemo(() => {
    if (!groupByAlphabet) {
      return { all: filteredAndSortedVouchers };
    }

    const grouped: Record<string, typeof filteredAndSortedVouchers> = {};
    filteredAndSortedVouchers.forEach((voucher) => {
      const firstLetter = voucher.code.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(voucher);
    });

    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, typeof filteredAndSortedVouchers>);
  }, [filteredAndSortedVouchers, groupByAlphabet]);

  const handleDeleteClick = (voucherId: string, voucherCode: string) => {
    setVoucherToDelete({ id: voucherId, code: voucherCode });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      await deleteVoucher(voucherToDelete.id);
      addToast({
        type: "success",
        title: "Voucher Berhasil di Hapus",
        message: `Voucher ${voucherToDelete.code} telah dihapus dari sistem`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Gagal menghapus voucher",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setVoucherToDelete(null);
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

  const getVoucherStatusInfo = (voucher: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = voucher.expiryDate ? new Date(voucher.expiryDate) : null;
    if (expiryDate) {
      expiryDate.setHours(0, 0, 0, 0);
    }

    // Check expiry date
    const isExpiredByDate = expiryDate && expiryDate < today;

    // Check max usage
    const isExpiredByUsage =
      voucher.maxUsage !== null && voucher.usageCount >= voucher.maxUsage;

    let status = "Aktif";
    let color = "bg-green-100 text-green-800";
    let tooltip = "";

    if (isExpiredByDate) {
      status = "Kadaluarsa";
      color = "bg-red-100 text-red-800";
      tooltip = `Voucher kadaluarsa pada ${new Date(
        voucher.expiryDate
      ).toLocaleDateString("id-ID")}`;
    } else if (isExpiredByUsage) {
      status = "Batas Tercapai";
      color = "bg-gray-100 text-gray-800";
      tooltip = `Penggunaan maksimal tercapai (${voucher.usageCount}/${voucher.maxUsage})`;
    } else if (
      voucher.maxUsage &&
      voucher.usageCount >= voucher.maxUsage * 0.8
    ) {
      // Warning if 80% usage reached
      status = "Aktif (Hampir Penuh)";
      color = "bg-yellow-100 text-yellow-800";
      tooltip = `Penggunaan: ${voucher.usageCount}/${voucher.maxUsage}`;
    } else {
      tooltip = "Voucher dapat digunakan";
    }

    return { status, color, tooltip };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("vouchers.title")}
          </h1>
          <p className="text-gray-600">{t("vouchers.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t("vouchers.addVoucher")}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t("vouchers.searchVouchers")}
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
                <option value="all">{t("vouchers.allStatus")}</option>
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
                <option value="expired">{t("common.expired")}</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredAndSortedVouchers.length} {t("vouchers.of")}{" "}
              {vouchers.length} voucher
            </div>
          </div>

          {/* Group by Alphabet Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={groupByAlphabet}
                onChange={(e) => setGroupByAlphabet(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t("vouchers.groupByAlphabet")}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">
              {t("vouchers.loadingVouchers")}
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("vouchers.failedToLoad")}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshVouchers}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>{t("vouchers.voucherName")}</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("code")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{t("vouchers.voucherCode")}</span>
                        {getSortIcon("code")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("discount")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{t("vouchers.discount")}</span>
                        {getSortIcon("discount")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>{t("vouchers.maxDiscount")}</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("expiryDate")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{t("vouchers.expiryDate")}</span>
                        {getSortIcon("expiryDate")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("usage")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{t("vouchers.usageCount")}</span>
                        {getSortIcon("usage")}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedVouchers).map(
                    ([group, vouchersInGroup]) => (
                      <React.Fragment key={group}>
                        {groupByAlphabet && (
                          <tr className="bg-gray-100">
                            <td
                              colSpan={7}
                              className="px-6 py-3 text-sm font-semibold text-gray-700"
                            >
                              {group} ({vouchersInGroup.length} voucher
                              {vouchersInGroup.length > 1 ? "s" : ""})
                            </td>
                          </tr>
                        )}
                        {vouchersInGroup.map((voucher) => {
                          const statusInfo = getVoucherStatusInfo(voucher);
                          return (
                            <tr key={voucher.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Ticket className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {voucher.nama || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                  {voucher.code}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {voucher.discountType === "percentage"
                                    ? `${voucher.discount}%`
                                    : `Rp ${voucher.discount.toLocaleString(
                                        "id-ID"
                                      )}`}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {voucher.maksimal_diskon
                                  ? `Rp ${voucher.maksimal_diskon.toLocaleString(
                                      "id-ID"
                                    )}`
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {voucher.expiryDate
                                  ? new Date(
                                      voucher.expiryDate
                                    ).toLocaleDateString("id-ID")
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-orange-500 h-2 rounded-full"
                                      style={{
                                        width: `${
                                          voucher.maxUsage
                                            ? (voucher.usageCount /
                                                voucher.maxUsage) *
                                              100
                                            : 0
                                        }%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {voucher.usageCount}
                                    {voucher.maxUsage
                                      ? `/${voucher.maxUsage}`
                                      : ""}
                                  </span>
                                </div>
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
                                      handleDeleteClick(
                                        voucher.id,
                                        voucher.code
                                      )
                                    }
                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                                    title="Hapus Voucher"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {filteredAndSortedVouchers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("vouchers.noVouchers")}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== "all"
                    ? t("vouchers.adjustSearchFilter")
                    : t("vouchers.noVouchersDesc")}
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
              <p className="text-sm font-medium text-gray-600">
                {t("vouchers.totalVoucher")}
              </p>
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
              <p className="text-sm font-medium text-gray-600">
                {t("vouchers.activeVoucher")}
              </p>
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
                {t("vouchers.totalUsage")}
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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVoucherToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        voucherCode={voucherToDelete?.code || ""}
      />
    </div>
  );
}
