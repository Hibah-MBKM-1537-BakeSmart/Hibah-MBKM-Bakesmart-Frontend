"use client";

import React, { useEffect } from "react";
import { useHistory } from "@/app/contexts/HistoryContext";
import {
  Clock,
  Phone,
  User,
  CreditCard,
  Package,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  Calendar,
} from "lucide-react";

export function OrderDetailModal() {
  const { state, closeOrderDetail } = useHistory();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOrderDetail();
      }
    };

    if (state.showOrderDetail) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [state.showOrderDetail, closeOrderDetail]);

  if (!state.showOrderDetail || !state.selectedOrder) {
    return null;
  }

  const order = state.selectedOrder;

  const handlePrint = () => {
    try {
      // Simply trigger print - the CSS @media print will handle the styling
      window.print();
    } catch (error) {
      console.error("Print failed:", error);
      alert("Gagal mencetak. Silakan coba lagi.");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Time";
      }
      return date.toLocaleTimeString("id-ID");
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Invalid Time";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid DateTime";
      }
      return date.toLocaleString("id-ID");
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "Invalid DateTime";
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "Rp 0";
    }
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return `Rp ${amount.toLocaleString("id-ID")}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "#d4edda",
          text: "#155724",
          border: "#c3e6cb",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          bg: "#f8d7da",
          text: "#721c24",
          border: "#f5c6cb",
          icon: XCircle,
        };
      case "paid":
        return {
          bg: "#d4edda",
          text: "#155724",
          border: "#c3e6cb",
          icon: CheckCircle,
        };
      case "processing":
        return {
          bg: "#fff3cd",
          text: "#856404",
          border: "#ffeaa7",
          icon: AlertCircle,
        };
      case "verifying":
        return {
          bg: "#d1ecf1",
          text: "#0c5460",
          border: "#bee5eb",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "#e2e3e5",
          text: "#383d41",
          border: "#d1ecf1",
          icon: AlertCircle,
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      case "paid":
        return "Dibayar";
      case "processing":
        return "Diproses";
      case "verifying":
        return "Verifikasi";
      default:
        return status;
    }
  };

  const statusInfo = getStatusColor(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }

          body * {
            visibility: hidden;
          }

          .print-receipt,
          .print-receipt * {
            visibility: visible;
          }

          .print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            background: white !important;
            padding: 5mm;
            font-family: "Courier New", monospace;
            font-size: 10pt;
            line-height: 1.4;
          }

          .no-print {
            display: none !important;
          }

          .print-receipt .receipt-header {
            text-align: center;
            margin-bottom: 5mm;
            padding-bottom: 3mm;
            border-bottom: 1px dashed #000;
          }

          .print-receipt .receipt-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 2mm;
          }

          .print-receipt .receipt-info {
            font-size: 9pt;
            margin: 1mm 0;
          }

          .print-receipt .receipt-section {
            margin: 4mm 0;
            padding: 2mm 0;
          }

          .print-receipt .section-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 1px solid #000;
          }

          .print-receipt .info-row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
            font-size: 9pt;
          }

          .print-receipt .product-item {
            margin: 2mm 0;
            padding: 1mm 0;
            border-bottom: 1px dashed #ccc;
          }

          .print-receipt .product-name {
            font-weight: bold;
            margin-bottom: 1mm;
          }

          .print-receipt .product-details {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
          }

          .print-receipt .totals {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 1px solid #000;
          }

          .print-receipt .total-row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
            font-size: 10pt;
          }

          .print-receipt .grand-total {
            font-weight: bold;
            font-size: 12pt;
            margin-top: 2mm;
            padding-top: 2mm;
            border-top: 2px double #000;
          }

          .print-receipt .receipt-footer {
            text-align: center;
            margin-top: 5mm;
            padding-top: 3mm;
            border-top: 1px dashed #000;
            font-size: 9pt;
          }
        }

        @media screen {
          .print-receipt {
            display: none;
          }
        }
      `}</style>

      {/* Modal Background Overlay */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(3px)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={closeOrderDetail}
      >
        {/* Hidden Print Receipt (Only visible when printing) */}
        <div className="print-receipt">
          <div className="receipt-header">
            <div className="receipt-title">BAKESMART</div>
            <div className="receipt-info">Order #{order.id}</div>
            <div className="receipt-info">{formatDate(order.created_at)}</div>
            <div className="receipt-info">{formatTime(order.created_at)}</div>
          </div>

          <div className="receipt-section">
            <div className="section-title">INFORMASI PESANAN</div>
            <div className="info-row">
              <span>Provider:</span>
              <span>{order.provider || "N/A"}</span>
            </div>
            {order.courier_name && (
              <div className="info-row">
                <span>Kurir:</span>
                <span>{order.courier_name}</span>
              </div>
            )}
            <div className="info-row">
              <span>Status:</span>
              <span>{getStatusText(order.status)}</span>
            </div>
          </div>

          <div className="receipt-section">
            <div className="section-title">DETAIL PESANAN</div>
            {order.products && order.products.length > 0 ? (
              <>
                {order.products.map((item) => (
                  <div key={item.id} className="product-item">
                    <div className="product-name">
                      {item.product_name_id ||
                        item.nama_id ||
                        item.product_name_en ||
                        item.nama_en ||
                        "Unknown Product"}
                    </div>
                    <div className="product-details">
                      <span>
                        {item.jumlah} x{" "}
                        {formatCurrency(item.harga_beli / item.jumlah)}
                      </span>
                      <span>{formatCurrency(item.harga_beli)}</span>
                    </div>
                    {item.note && (
                      <div
                        style={{
                          fontSize: "8pt",
                          fontStyle: "italic",
                          marginTop: "1mm",
                        }}
                      >
                        Note: {item.note}
                      </div>
                    )}
                  </div>
                ))}

                <div className="totals">
                  {order.shipping_cost && Number(order.shipping_cost) > 0 && (
                    <div className="total-row">
                      <span>Ongkos Kirim:</span>
                      <span>{formatCurrency(Number(order.shipping_cost))}</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(Number(order.total_harga))}</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "3mm 0" }}>
                Tidak ada item
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <div>Terima kasih atas pesanan Anda!</div>
            <div style={{ marginTop: "2mm" }}>BakeSmart - Roti Berkualitas</div>
            {order.waktu_ambil && (
              <div style={{ marginTop: "2mm", fontSize: "8pt" }}>
                Waktu Ambil: {formatDateTime(order.waktu_ambil)}
              </div>
            )}
            {order.note && (
              <div
                style={{
                  marginTop: "2mm",
                  fontSize: "8pt",
                  fontStyle: "italic",
                }}
              >
                Catatan: {order.note}
              </div>
            )}
          </div>
        </div>

        {/* Modal Content (Screen View) */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[10000] no-print"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "#e0d5c7" }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#f9f7f4" }}
              >
                <FileText className="w-5 h-5" style={{ color: "#8b6f47" }} />
              </div>
              <div>
                <h2
                  className="text-xl font-bold font-admin-heading"
                  style={{ color: "#5d4037" }}
                >
                  Detail Pesanan
                </h2>
                <p
                  className="text-sm font-admin-body"
                  style={{ color: "#8b6f47" }}
                >
                  Order #{order.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg border transition-colors"
                style={{ borderColor: "#e0d5c7", color: "#8b6f47" }}
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={closeOrderDetail}
                className="p-2 rounded-lg border transition-colors"
                style={{ borderColor: "#e0d5c7", color: "#8b6f47" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-3">
                <h3
                  className="font-semibold font-admin-heading"
                  style={{ color: "#5d4037" }}
                >
                  Informasi Pesanan
                </h3>
                <div className="space-y-2">
                  <div
                    className="flex items-center space-x-2 font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(order.created_at)}</span>
                  </div>
                  {order.updated_at &&
                    order.updated_at !== order.created_at && (
                      <div
                        className="flex items-center space-x-2 font-admin-body text-xs"
                        style={{ color: "#8b6f47" }}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          Diupdate: {formatDateTime(order.updated_at)}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <h3
                  className="font-semibold font-admin-heading"
                  style={{ color: "#5d4037" }}
                >
                  Detail Pembayaran & Pengiriman
                </h3>
                <div className="space-y-2">
                  <div
                    className="flex items-center space-x-2 font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Provider: {order.provider || "N/A"}</span>
                  </div>
                  {order.courier_name && (
                    <div
                      className="flex items-center space-x-2 font-admin-body"
                      style={{ color: "#8b6f47" }}
                    >
                      <Package className="w-4 h-4" />
                      <span>Kurir: {order.courier_name}</span>
                    </div>
                  )}
                  {order.tracking_link && (
                    <div
                      className="flex items-center space-x-2 font-admin-body text-xs"
                      style={{ color: "#8b6f47" }}
                    >
                      <a
                        href={order.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Lacak Paket
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-4">
              {/* Order Status */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#f9f7f4" }}
              >
                <h4
                  className="font-medium mb-2 font-admin-heading"
                  style={{ color: "#5d4037" }}
                >
                  Status Pesanan
                </h4>
                <div className="flex items-center space-x-2">
                  <StatusIcon
                    className="w-5 h-5"
                    style={{ color: statusInfo.text }}
                  />
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full font-admin-body"
                    style={{
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.text,
                      border: `1px solid ${statusInfo.border}`,
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                {order.waktu_ambil && (
                  <p
                    className="text-sm mt-2 font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    Waktu Ambil: {formatDateTime(order.waktu_ambil)}
                  </p>
                )}
                {order.note && (
                  <p
                    className="text-sm mt-2 font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    Catatan: {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3
                className="font-semibold mb-4 font-admin-heading"
                style={{ color: "#5d4037" }}
              >
                Detail Pesanan
              </h3>
              <div
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: "#e0d5c7" }}
              >
                <table className="w-full">
                  <thead style={{ backgroundColor: "#f9f7f4" }}>
                    <tr>
                      <th
                        className="text-left p-3 font-admin-heading"
                        style={{ color: "#5d4037" }}
                      >
                        Produk
                      </th>
                      <th
                        className="text-center p-3 font-admin-heading"
                        style={{ color: "#5d4037" }}
                      >
                        Qty
                      </th>
                      <th
                        className="text-right p-3 font-admin-heading"
                        style={{ color: "#5d4037" }}
                      >
                        Harga
                      </th>
                      <th
                        className="text-right p-3 font-admin-heading"
                        style={{ color: "#5d4037" }}
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products && order.products.length > 0 ? (
                      order.products.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t"
                          style={{ borderColor: "#e0d5c7" }}
                        >
                          <td
                            className="p-3 font-admin-body"
                            style={{ color: "#5d4037" }}
                          >
                            {item.product_name_id ||
                              item.nama_id ||
                              item.product_name_en ||
                              item.nama_en ||
                              "Unknown Product"}
                            {item.note && (
                              <div className="text-xs text-gray-500 mt-1">
                                Note: {item.note}
                              </div>
                            )}
                          </td>
                          <td
                            className="p-3 text-center font-admin-body"
                            style={{ color: "#8b6f47" }}
                          >
                            {item.jumlah}
                          </td>
                          <td
                            className="p-3 text-right font-admin-body"
                            style={{ color: "#8b6f47" }}
                          >
                            {formatCurrency(item.harga_beli / item.jumlah)}
                          </td>
                          <td
                            className="p-3 text-right font-admin-body"
                            style={{ color: "#5d4037" }}
                          >
                            {formatCurrency(item.harga_beli)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-gray-500 font-admin-body"
                        >
                          Tidak ada item dalam pesanan ini
                        </td>
                      </tr>
                    )}
                    {order.products && order.products.length > 0 && (
                      <>
                        {order.shipping_cost &&
                          Number(order.shipping_cost) > 0 && (
                            <tr
                              className="border-t"
                              style={{ borderColor: "#e0d5c7" }}
                            >
                              <td
                                colSpan={3}
                                className="p-3 text-right font-admin-body"
                                style={{ color: "#5d4037" }}
                              >
                                Ongkos Kirim:
                              </td>
                              <td
                                className="p-3 text-right font-admin-body"
                                style={{ color: "#5d4037" }}
                              >
                                {formatCurrency(Number(order.shipping_cost))}
                              </td>
                            </tr>
                          )}
                        <tr
                          className="border-t font-bold"
                          style={{
                            borderColor: "#e0d5c7",
                            backgroundColor: "#f9f7f4",
                          }}
                        >
                          <td
                            colSpan={3}
                            className="p-3 text-right font-admin-heading"
                            style={{ color: "#5d4037" }}
                          >
                            Total:
                          </td>
                          <td
                            className="p-3 text-right font-admin-heading"
                            style={{ color: "#5d4037" }}
                          >
                            {formatCurrency(Number(order.total_harga))}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end space-x-3 p-6 border-t no-print"
            style={{ borderColor: "#e0d5c7" }}
          >
            <button
              onClick={closeOrderDetail}
              className="px-4 py-2 border rounded-lg transition-colors font-admin-body"
              style={{ borderColor: "#e0d5c7", color: "#8b6f47" }}
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg text-white transition-colors font-admin-body"
              style={{ backgroundColor: "#8b6f47" }}
            >
              Print Struk
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
