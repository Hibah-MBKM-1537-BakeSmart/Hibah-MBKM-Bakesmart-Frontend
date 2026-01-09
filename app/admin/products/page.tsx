"use client";

import React, { useState } from "react";
import { Package, Tag, Layers, Settings } from "lucide-react";
import { useToast } from "@/components/adminPage/Toast";
import { JenisTab } from "@/components/adminPage/productsPage/JenisTab";
import { SubJenisTab } from "@/components/adminPage/productsPage/SubJenisTab";
import { ProductsTab } from "@/components/adminPage/productsPage/ProductsTab";

type TabType = "products" | "jenis" | "sub_jenis";

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("jenis");
  const { ToastContainer } = useToast();

  const tabs = [
    {
      id: "jenis" as TabType,
      label: "Jenis (Kategori)",
      icon: Tag,
      description: "Kelola kategori utama",
    },
    {
      id: "sub_jenis" as TabType,
      label: "Sub Jenis (Konfigurasi)",
      icon: Layers,
      description: "Kelola sub kategori & konfigurasi",
    },
    {
      id: "products" as TabType,
      label: "Produk",
      icon: Package,
      description: "Kelola daftar produk roti",
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-gray-600 text-sm lg:text-base mt-1">
            Kelola produk, kategori (jenis), dan sub kategori (sub jenis) dengan
            konfigurasi lengkap
          </p>
        </div>
      </div>

      {/* Flow Indicator */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5 text-orange-600" />
          <h3 className="font-medium text-orange-800">
            Alur Pengaturan Produk
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === "jenis"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            1. Buat Jenis
          </span>
          <span className="text-gray-400">→</span>
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === "sub_jenis"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            2. Buat Sub Jenis + Konfigurasi
          </span>
          <span className="text-gray-400">→</span>
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === "products"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            3. Tambah Produk
          </span>
        </div>
        <p className="text-xs text-orange-700 mt-2">
          💡 Tip: Buat Jenis dan Sub Jenis terlebih dahulu sebelum menambahkan
          produk untuk mengatur hari tersedia, jumlah pesanan, dan add-ons.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 group relative min-w-0 flex flex-col items-center justify-center py-4 px-4 
                    text-sm font-medium text-center
                    border-b-2 transition-all duration-200
                    ${
                      isActive
                        ? "border-orange-500 text-orange-600 bg-orange-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-orange-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </div>
                  <span
                    className={`hidden lg:block text-xs mt-1 ${
                      isActive ? "text-orange-500" : "text-gray-400"
                    }`}
                  >
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === "jenis" && <JenisTab />}
          {activeTab === "sub_jenis" && <SubJenisTab />}
          {activeTab === "products" && <ProductsTab />}
        </div>
      </div>
    </div>
  );
}
