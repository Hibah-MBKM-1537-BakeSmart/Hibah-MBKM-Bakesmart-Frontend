"use client";

import React, { useState, useEffect } from "react";
import { useCustomers } from "@/app/contexts/CustomersContext";
import { X, MessageCircle, Users, Calendar, Send } from "lucide-react";

interface WhatsAppBlastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlastConfig {
  period: "1month" | "3months" | "6months";
  customMessage: string;
  includeName: boolean;
}

export function WhatsAppBlastModal({
  isOpen,
  onClose,
}: WhatsAppBlastModalProps) {
  const { state } = useCustomers();
  const [config, setConfig] = useState<BlastConfig>({
    period: "3months",
    customMessage: "",
    includeName: true,
  });
  const [targetCustomers, setTargetCustomers] = useState<
    typeof state.customers
  >([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Template pesan default
  const defaultMessages = {
    "1month":
      "Halo{name}! Sudah lama nih tidak berkunjung ke BakeSmart 😊 Ada promo spesial untuk kamu! Yuk pesan lagi roti favoritmu 🍞✨",
    "3months":
      "Hai{name}! Kangen sama roti enak dari BakeSmart? 🥰 Kami punya menu baru yang pasti kamu suka! Buruan pesan sebelum kehabisan 🍰",
    "6months":
      "Hello{name}! Lama tidak berjumpa 👋 BakeSmart kini hadir dengan inovasi rasa baru yang lebih nikmat! Jangan sampai terlewat ya 🎂🌟",
  };

  // Hitung customer yang sudah lama tidak beli
  useEffect(() => {
    if (!isOpen) return;

    setIsAnalyzing(true);

    // Simulasi analisis dengan delay
    setTimeout(() => {
      const now = new Date();
      const periodInMs = {
        "1month": 30 * 24 * 60 * 60 * 1000,
        "3months": 90 * 24 * 60 * 60 * 1000,
        "6months": 180 * 24 * 60 * 60 * 1000,
      };

      const cutoffDate = new Date(now.getTime() - periodInMs[config.period]);

      const targets = state.customers.filter((customer) => {
        if (!customer.lastPurchase) return true; // Customer yang belum pernah beli

        const lastPurchaseDate = new Date(customer.lastPurchase.created_at);
        return lastPurchaseDate < cutoffDate;
      });

      setTargetCustomers(targets);
      setSelectedCustomerIds(targets.map((c) => c.id));
      setIsAnalyzing(false);
    }, 1000);
  }, [isOpen, config.period, state.customers]);

  // Set default message berdasarkan periode
  useEffect(() => {
    if (config.customMessage === "") {
      setConfig((prev) => ({
        ...prev,
        customMessage: defaultMessages[config.period],
      }));
    }
  }, [config.period]);

  const toggleCustomerSelection = (customerId: number) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === targetCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(targetCustomers.map((c) => c.id));
    }
  };

  const handleSendBlast = async () => {
    if (selectedCustomerIds.length === 0) return;

    setIsSending(true);

    try {
      // Handle logic includeName sebelum kirim ke backend
      // Jika includeName false, hapus placeholder {name}
      // Jika true, biarkan {name} agar backend yang replace dengan nama customer
      let messageToSend = config.customMessage;
      if (!config.includeName) {
        messageToSend = messageToSend.replace("{name}", "");
      }

      const response = await fetch("/api/whatsapp/blast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_type: "selected",
          customer_ids: selectedCustomerIds,
          message: messageToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim blast");
      }

      // Notifikasi sukses
      alert(
        `WhatsApp blast berhasil dijadwalkan untuk ${selectedCustomerIds.length} customer!`
      );

      // Reset form
      setConfig({
        period: "3months",
        customMessage: "",
        includeName: true,
      });
      onClose();
    } catch (error) {
      console.error("Error sending blast:", error);
      alert("Terjadi kesalahan saat mengirim blast. Silakan coba lagi.");
    } finally {
      setIsSending(false);
    }
  };

  const formatPeriodLabel = (period: string) => {
    switch (period) {
      case "1month":
        return "1 Bulan";
      case "3months":
        return "3 Bulan";
      case "6months":
        return "6 Bulan";
      default:
        return period;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/10 backdrop-blur-[2px]"
      onClick={onClose} // Klik di backdrop untuk close
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
        style={{ borderColor: "#e0d5c7" }}
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b flex-shrink-0"
          style={{ borderColor: "#e0d5c7" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2
                className="text-xl font-semibold font-admin-heading"
                style={{ color: "#5d4037" }}
              >
                WhatsApp Blast
              </h2>
              <p
                className="text-sm font-admin-body"
                style={{ color: "#8b6f47" }}
              >
                Kirim pesan promosi ke customer yang lama tidak beli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSending}
          >
            <X className="w-5 h-5" style={{ color: "#8b6f47" }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Periode Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-3 font-admin-body"
                style={{ color: "#5d4037" }}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Periode Customer Tidak Aktif
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["1month", "3months", "6months"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        period,
                        customMessage: "",
                      }))
                    }
                    className={`p-3 rounded-lg border text-center transition-colors font-admin-body ${
                      config.period === period
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-200 hover:border-amber-200"
                    }`}
                    style={{
                      borderColor:
                        config.period === period ? "#fcd34d" : "#e0d5c7",
                      backgroundColor:
                        config.period === period ? "#fefdf8" : "white",
                      color: config.period === period ? "#92400e" : "#8b6f47",
                    }}
                    disabled={isSending}
                  >
                    <div className="font-medium">
                      {formatPeriodLabel(period)}
                    </div>
                    <div className="text-xs mt-1">
                      Lebih dari {formatPeriodLabel(period).toLowerCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium font-admin-body text-blue-800">
                  Analisis Target Customer
                </span>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-admin-body text-blue-700">
                    Menganalisis customer...
                  </span>
                </div>
              ) : (
                <div className="text-sm font-admin-body text-blue-700">
                  <strong>{targetCustomers.length}</strong> customer ditemukan
                  yang tidak membeli selama lebih dari{" "}
                  <strong>
                    {formatPeriodLabel(config.period).toLowerCase()}
                  </strong>
                </div>
              )}
            </div>

            {/* Message Template */}
            <div>
              <label
                className="block text-sm font-medium mb-3 font-admin-body"
                style={{ color: "#5d4037" }}
              >
                Template Pesan
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeName"
                    checked={config.includeName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        includeName: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    disabled={isSending}
                  />
                  <label
                    htmlFor="includeName"
                    className="text-sm font-admin-body"
                    style={{ color: "#8b6f47" }}
                  >
                    Sertakan nama customer (gunakan {"{name}"} dalam pesan)
                  </label>
                </div>

                <textarea
                  value={config.customMessage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      customMessage: e.target.value,
                    }))
                  }
                  placeholder="Tulis pesan promosi Anda..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none font-admin-body"
                  style={{ borderColor: "#e0d5c7", minHeight: "120px" }}
                  disabled={isSending}
                />
                <div
                  className="text-xs font-admin-body"
                  style={{ color: "#8b6f47" }}
                >
                  Tip: Gunakan emoji dan bahasa yang ramah untuk menarik
                  perhatian customer
                </div>
              </div>
            </div>

            {/* Preview */}
            {config.customMessage && (
              <div>
                <label
                  className="block text-sm font-medium mb-2 font-admin-body"
                  style={{ color: "#5d4037" }}
                >
                  Preview Pesan
                </label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-admin-body text-green-800">
                    {config.includeName
                      ? config.customMessage.replace(
                          "{name}",
                          " [Nama Customer]"
                        )
                      : config.customMessage.replace("{name}", "")}
                  </div>
                </div>
              </div>
            )}

            {/* Customer List Preview */}
            {targetCustomers.length > 0 && !isAnalyzing && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-sm font-medium font-admin-body"
                    style={{ color: "#5d4037" }}
                  >
                    Target Customer ({selectedCustomerIds.length}/
                    {targetCustomers.length})
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-medium hover:underline"
                    style={{ color: "#8b6f47" }}
                  >
                    {selectedCustomerIds.length === targetCustomers.length
                      ? "Batal Pilih Semua"
                      : "Pilih Semua"}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {targetCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center p-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      style={{ borderColor: "#e0d5c7" }}
                      onClick={() => toggleCustomerSelection(customer.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => {}} // Handled by parent div onClick
                        className="w-4 h-4 mr-3 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <div
                            className="font-medium text-sm font-admin-body"
                            style={{ color: "#5d4037" }}
                          >
                            {customer.nama}
                          </div>
                          <div
                            className="text-xs font-admin-body"
                            style={{ color: "#8b6f47" }}
                          >
                            {customer.no_hp}
                          </div>
                        </div>
                        <div
                          className="text-xs font-admin-body"
                          style={{ color: "#8b6f47" }}
                        >
                          {customer.lastPurchase
                            ? `Terakhir: ${new Date(
                                customer.lastPurchase.created_at
                              ).toLocaleDateString("id-ID")}`
                            : "Belum pernah beli"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0"
          style={{ borderColor: "#e0d5c7" }}
        >
          <div className="text-sm font-admin-body" style={{ color: "#8b6f47" }}>
            {isSending
              ? "Mengirim pesan WhatsApp..."
              : `Siap mengirim ke ${selectedCustomerIds.length} customer terpilih`}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-admin-body hover:bg-gray-50 transition-colors"
              style={{ color: "#8b6f47", borderColor: "#e0d5c7" }}
              disabled={isSending}
            >
              Batal
            </button>
            <button
              onClick={handleSendBlast}
              disabled={
                selectedCustomerIds.length === 0 ||
                !config.customMessage.trim() ||
                isSending
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-admin-body hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Blast
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
