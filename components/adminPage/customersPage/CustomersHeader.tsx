"use client";

import React, { useRef, useState } from "react";
import {
  Users,
  UserCheck,
  Activity,
  MessageCircle,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import { useCustomers } from "../../../app/contexts/CustomersContext";

export default function CustomersHeader() {
  const {
    state,
    openWhatsAppBlast,
    exportToExcel,
    importCustomers,
    refreshCustomers,
  } = useCustomers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel();
    } catch (error) {
      alert("Failed to export customers");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        const result = await importCustomers(file);
        alert(
          `Import berhasil! ${result?.data?.inserted || 0} data ditambahkan, ${
            result?.data?.skipped || 0
          } data dilewati.`
        );
      } catch (error) {
        alert("Failed to import customers");
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    }
  };

  // Calculate statistics
  const totalCustomers = state.customers.length;
  const activeMembers = state.customers.filter((c) => c.role === "user").length;
  const activeNow = state.customers.filter((c) => {
    if (!c.lastPurchase) return false;
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(c.lastPurchase.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSinceLastPurchase <= 7; // Active if purchased within last 7 days
  }).length;

  const statisticsCards = [
    {
      title: "Total Customers",
      value: totalCustomers,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Members",
      value: activeMembers,
      change: "+5.3%",
      changeType: "positive" as const,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Active This Week",
      value: activeNow,
      change: "-1.2%",
      changeType: "negative" as const,
      icon: Activity,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="mb-6">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Customers
          </h1>
          <p className="text-gray-600 font-inter">
            Manage your customer base and relationships
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export
          </button>
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-inter disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import
          </button>
          <button
            onClick={openWhatsAppBlast}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-inter"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Blast
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statisticsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-inter">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 font-poppins mt-1">
                    {card.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium font-inter ${
                        card.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 font-inter">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
