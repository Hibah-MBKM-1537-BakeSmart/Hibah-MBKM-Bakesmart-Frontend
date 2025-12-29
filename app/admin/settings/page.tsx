"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Input, Textarea, TimePicker } from "@/components/adminPage";
import {
  Save,
  Smartphone,
  Clock,
  AlertCircle,
  MapPin,
  ShoppingCart,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  useStoreClosure,
  OperatingHour,
} from "@/app/contexts/StoreClosureContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store-closure");
  const [savingStoreConfig, setSavingStoreConfig] = useState(false);
  const [storeConfigMessage, setStoreConfigMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const {
    closure,
    updateClosure,
    config,
    updateConfig,
    saveConfig,
    isLoading: configLoading,
    error: configError,
  } = useStoreClosure();

  // WhatsApp Connect State
  const [waStatus, setWaStatus] = useState<{
    is_connected: boolean;
    qr_code: string | null;
    message?: string;
  }>({ is_connected: false, qr_code: null });
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp?")) return;

    setDisconnecting(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setWaStatus((prev) => ({
          ...prev,
          is_connected: false,
          qr_code: null,
        }));
        // The polling interval will pick up the new QR code eventually
      } else {
        alert("Failed to disconnect: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      alert("Error disconnecting WhatsApp");
    } finally {
      setDisconnecting(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchWaStatus = async () => {
      try {
        if (activeTab !== "notifications") return;

        const res = await fetch("/api/whatsapp/status");
        const data = await res.json();

        if (data.success) {
          setWaStatus({
            is_connected: data.is_connected,
            qr_code: data.qr_code,
            message: data.message,
          });
        }
      } catch (err) {
        console.error("Failed to fetch WhatsApp status", err);
      }
    };

    if (activeTab === "notifications") {
      fetchWaStatus(); // Initial fetch
      interval = setInterval(fetchWaStatus, 3000); // Poll every 3s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  const tabs = [
    { id: "store-closure", label: "Konfigurasi Toko", icon: AlertCircle },
    { id: "notifications", label: "Koneksi WhatsApp", icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your application settings and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      activeTab === tab.id ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    WhatsApp Server Connection
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Scan the QR code to connect the WhatsApp server for
                      automated notifications.
                    </p>

                    {waStatus.is_connected ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Smartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              WhatsApp Connected
                            </p>
                            <p className="text-xs text-green-600">
                              Server is ready to send messages.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                          {disconnecting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            "Disconnect WhatsApp"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        {waStatus.qr_code ? (
                          <div className="mb-4 p-2 bg-white border rounded shadow-sm">
                            <QRCodeCanvas value={waStatus.qr_code} size={200} />
                          </div>
                        ) : (
                          <div className="mb-4 h-[200px] w-[200px] bg-gray-100 rounded flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                          </div>
                        )}
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          Scan QR Code
                        </h5>
                        <p className="text-xs text-gray-500 max-w-xs">
                          Open WhatsApp on your phone {">"} Menu {">"} Linked
                          Devices {">"} Link a Device
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "store-closure" && (
              <div className="space-y-6">
                {/* Loading State */}
                {configLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <span className="ml-2 text-gray-600">
                      Loading configuration...
                    </span>
                  </div>
                )}

                {/* Error State */}
                {configError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{configError}</p>
                  </div>
                )}

                {/* Success/Error Message */}
                {storeConfigMessage && (
                  <div
                    className={`p-4 rounded-lg border ${
                      storeConfigMessage.type === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        storeConfigMessage.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {storeConfigMessage.text}
                    </p>
                  </div>
                )}

                {!configLoading && (
                  <>
                    {/* Delivery Settings Section */}
                    <div className="border-b pb-6 mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Delivery Settings
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Configure delivery options for your customers
                      </p>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Enable Delivery Service
                          </h4>
                          <p className="text-sm text-gray-500">
                            Allow customers to choose delivery option
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.is_delivery_enabled ?? true}
                          onChange={(e) =>
                            updateConfig({
                              is_delivery_enabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Store Closure Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Store Closure Settings
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Configure when your store will be closed and set a
                        message for customers
                      </p>

                      <div className="space-y-6">
                        {/* Store Closure Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Enable Store Closure
                            </h4>
                            <p className="text-sm text-gray-500">
                              Temporarily close the store for orders
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.is_tutup}
                            onChange={(e) =>
                              updateConfig({ is_tutup: e.target.checked })
                            }
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                        </div>

                        {/* WhatsApp Number for Closure */}
                        <Input
                          label="WhatsApp Number (for Store Closed Modal)"
                          value={config.whatsapp_number || ""}
                          onChange={(e) =>
                            updateConfig({ whatsapp_number: e.target.value })
                          }
                          placeholder="6281234567890"
                          icon={Smartphone}
                        />

                        {/* Closure Details - Show when store is closed */}
                        {config.is_tutup && (
                          <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <Textarea
                              label="Closure Message"
                              value={config.pesan}
                              onChange={(e) =>
                                updateConfig({ pesan: e.target.value })
                              }
                              placeholder="e.g., We are closed for renovation. See you soon!"
                              rows={3}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Reopening Date"
                                type="date"
                                value={(() => {
                                  if (!config.tgl_buka) return "";
                                  const date = new Date(config.tgl_buka);
                                  const year = date.getFullYear();
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  return `${year}-${month}-${day}`;
                                })()}
                                onChange={(e) => {
                                  if (!e.target.value) {
                                    updateConfig({ tgl_buka: "" });
                                    return;
                                  }
                                  const existingDate = config.tgl_buka
                                    ? new Date(config.tgl_buka)
                                    : new Date();
                                  const [year, month, day] = e.target.value
                                    .split("-")
                                    .map(Number);
                                  existingDate.setFullYear(year);
                                  existingDate.setMonth(month - 1);
                                  existingDate.setDate(day);
                                  updateConfig({
                                    tgl_buka: existingDate.toISOString(),
                                  });
                                }}
                              />
                              <TimePicker
                                label="Reopening Time"
                                value={(() => {
                                  if (!config.tgl_buka) return "00:00";
                                  const date = new Date(config.tgl_buka);
                                  const hours = String(
                                    date.getHours()
                                  ).padStart(2, "0");
                                  const minutes = String(
                                    date.getMinutes()
                                  ).padStart(2, "0");
                                  return `${hours}:${minutes}`;
                                })()}
                                onChange={(value) => {
                                  if (!value) return;
                                  const existingDate = config.tgl_buka
                                    ? new Date(config.tgl_buka)
                                    : new Date();
                                  const [hours, minutes] = value
                                    .split(":")
                                    .map(Number);
                                  existingDate.setHours(hours);
                                  existingDate.setMinutes(minutes);
                                  existingDate.setSeconds(0);
                                  existingDate.setMilliseconds(0);
                                  updateConfig({
                                    tgl_buka: existingDate.toISOString(),
                                  });
                                }}
                                icon={Clock}
                              />
                            </div>
                            {config.tgl_buka && (
                              <div className="p-3 bg-white rounded border border-red-200">
                                <p className="text-sm text-gray-600">
                                  <strong>Store will reopen on:</strong>{" "}
                                  {new Date(config.tgl_buka).toLocaleString(
                                    "id-ID",
                                    {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Limits Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Order Limits
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Set daily order limits and order cutoff time
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Daily Order Limit"
                          type="number"
                          value={config.limit_pesanan_harian || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig({
                              limit_pesanan_harian:
                                val === "" ? 0 : parseInt(val, 10),
                            });
                          }}
                          min="0"
                          icon={ShoppingCart}
                        />
                        <TimePicker
                          label="Order Cutoff Time"
                          value={
                            config.limit_jam_order
                              ? config.limit_jam_order.slice(0, 5)
                              : "00:00"
                          }
                          onChange={(value) =>
                            updateConfig({
                              limit_jam_order: value ? `${value}:00` : "",
                            })
                          }
                          icon={Clock}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Orders will not be accepted after the cutoff time each
                        day.
                      </p>
                    </div>

                    {/* Operating Hours Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Jam Operasional
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Atur jam buka dan tutup toko untuk setiap hari dalam
                        seminggu
                      </p>

                      <div className="space-y-3">
                        {(config.operating_hours || []).map(
                          (hour: OperatingHour) => (
                            <div
                              key={hour.day_index}
                              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border ${
                                hour.is_open
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              {/* Day Name & Toggle */}
                              <div className="flex items-center justify-between sm:w-36">
                                <span className="font-medium text-gray-900">
                                  {hour.day_name}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={hour.is_open}
                                  onChange={(e) => {
                                    const updatedHours =
                                      config.operating_hours.map((h) =>
                                        h.day_index === hour.day_index
                                          ? { ...h, is_open: e.target.checked }
                                          : h
                                      );
                                    updateConfig({
                                      operating_hours: updatedHours,
                                    });
                                  }}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded sm:hidden"
                                />
                              </div>

                              {/* Open/Close Toggle for Desktop */}
                              <div className="hidden sm:flex items-center">
                                <input
                                  type="checkbox"
                                  checked={hour.is_open}
                                  onChange={(e) => {
                                    const updatedHours =
                                      config.operating_hours.map((h) =>
                                        h.day_index === hour.day_index
                                          ? { ...h, is_open: e.target.checked }
                                          : h
                                      );
                                    updateConfig({
                                      operating_hours: updatedHours,
                                    });
                                  }}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <span
                                  className={`ml-2 text-sm ${
                                    hour.is_open
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {hour.is_open ? "Buka" : "Tutup"}
                                </span>
                              </div>

                              {/* Time Pickers */}
                              {hour.is_open && (
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex-1">
                                    <TimePicker
                                      label=""
                                      value={hour.open_time}
                                      onChange={(value) => {
                                        const updatedHours =
                                          config.operating_hours.map((h) =>
                                            h.day_index === hour.day_index
                                              ? {
                                                  ...h,
                                                  open_time: value || "08:00",
                                                }
                                              : h
                                          );
                                        updateConfig({
                                          operating_hours: updatedHours,
                                        });
                                      }}
                                      icon={Clock}
                                    />
                                  </div>
                                  <span className="text-gray-500">-</span>
                                  <div className="flex-1">
                                    <TimePicker
                                      label=""
                                      value={hour.close_time}
                                      onChange={(value) => {
                                        const updatedHours =
                                          config.operating_hours.map((h) =>
                                            h.day_index === hour.day_index
                                              ? {
                                                  ...h,
                                                  close_time: value || "21:00",
                                                }
                                              : h
                                          );
                                        updateConfig({
                                          operating_hours: updatedHours,
                                        });
                                      }}
                                      icon={Clock}
                                    />
                                  </div>
                                </div>
                              )}

                              {!hour.is_open && (
                                <div className="flex-1 text-center sm:text-left">
                                  <span className="text-sm text-gray-500 italic">
                                    Toko tutup pada hari ini
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Store Location Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Store Location
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Set your store&apos;s GPS coordinates for delivery
                        calculations
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Latitude"
                          type="text"
                          value={config.latitude}
                          onChange={(e) =>
                            updateConfig({ latitude: e.target.value })
                          }
                          placeholder="-6.3031123"
                          icon={MapPin}
                        />
                        <Input
                          label="Longitude"
                          type="text"
                          value={config.longitude}
                          onChange={(e) =>
                            updateConfig({ longitude: e.target.value })
                          }
                          placeholder="106.7794934999"
                          icon={MapPin}
                        />
                      </div>
                      {config.latitude && config.longitude && (
                        <div className="mt-4">
                          <a
                            href={`https://www.google.com/maps?q=${config.latitude},${config.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-orange-600 hover:text-orange-700 underline"
                          >
                            View location on Google Maps →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Save Button for Store Config */}
                    <div className="border-t pt-6">
                      <Button
                        onClick={async () => {
                          setSavingStoreConfig(true);
                          setStoreConfigMessage(null);
                          const success = await saveConfig();
                          setSavingStoreConfig(false);
                          if (success) {
                            setStoreConfigMessage({
                              type: "success",
                              text: "Store configuration saved successfully!",
                            });
                          } else {
                            setStoreConfigMessage({
                              type: "error",
                              text: "Failed to save configuration. Please try again.",
                            });
                          }
                          // Clear message after 3 seconds
                          setTimeout(() => setStoreConfigMessage(null), 3000);
                        }}
                        disabled={savingStoreConfig}
                        className="w-full sm:w-auto"
                      >
                        {savingStoreConfig ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Store Configuration
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
