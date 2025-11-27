"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  key: string;
}

const recentOrders = [
  {
    id: 1,
    customer: "Budi Santoso",
    customerPhone: "081234567890",
    product: "Chocolate Cake",
    quantity: 1,
    amount: 125000,
    status: "completed" as const,
    created_at: "2024-12-15T08:00:00.000Z",
  },
  {
    id: 2,
    customer: "Siti Nurhasanah",
    customerPhone: "082345678901",
    product: "Birthday Cake",
    quantity: 1,
    amount: 200000,
    status: "baked" as const,
    created_at: "2024-12-15T12:00:00.000Z",
  },
  {
    id: 3,
    customer: "Ahmad Wijaya",
    customerPhone: "083456789012",
    product: "Donuts Box (12 pcs)",
    quantity: 2,
    amount: 120000,
    status: "completed" as const,
    created_at: "2024-12-14T14:00:00.000Z",
  },
  {
    id: 4,
    customer: "Rina Marlina",
    customerPhone: "084567890123",
    product: "Wedding Cake",
    quantity: 1,
    amount: 750000,
    status: "paid" as const,
    created_at: "2024-12-14T08:00:00.000Z",
  },
];

const topProducts = [
  {
    id: 1,
    nama: "Chocolate Cake",
    sales: 145,
    revenue: 18125000,
    stok: 10,
  },
  {
    id: 2,
    nama: "Red Velvet Cupcakes",
    sales: 89,
    revenue: 1335000,
    stok: 24,
  },
  {
    id: 4,
    nama: "Birthday Cake",
    sales: 67,
    revenue: 13400000,
    stok: 5,
  },
  {
    id: 5,
    nama: "Donuts Box (12 pcs)",
    sales: 234,
    revenue: 14040000,
    stok: 8,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { language, tAdminSync } = useAdminTranslation();

  // State tunggal untuk menampung SEMUA teks UI statis agar bisa ditranslate API
  const [uiText, setUiText] = useState({
    dashboardTitle: "Dashboard",
    dashboardSubtitle:
      "Welcome back! Here's what's happening with your bakery.",
    vsLastMonth: "vs last month",
    recentOrders: "Recent Orders",
    viewAllOrders: "View All Orders",
    topProducts: "Top Products",
    quickActions: "Quick Actions",
    addProduct: "Add Product",
    viewKasir: "View Kasir",
    manageUsers: "Manage Users",
    viewReports: "View Reports",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    sales: "sales",
    stock: "Stock",
  });

  // State untuk menyimpan hasil terjemahan API untuk Stats (Title)
  const [apiTranslations, setApiTranslations] = useState<{
    [key: string]: string;
  }>({});

  const stats: StatCard[] = useMemo(
    () => [
      {
        title: "Total Revenue",
        key: "Total Revenue",
        value: "Rp 45,320,000",
        change: "+12.5%",
        changeType: "increase",
        icon: DollarSign,
        color: "#10B981",
      },
      {
        title: "Total Orders",
        key: "Total Orders",
        value: "1,234",
        change: "+8.2%",
        changeType: "increase",
        icon: ShoppingCart,
        color: "#3B82F6",
      },
      {
        title: "Total Products",
        key: "Total Products",
        value: "156",
        change: "+3.1%",
        changeType: "increase",
        icon: Package,
        color: "#8B5CF6",
      },
      {
        title: "Total Customers",
        key: "Total Customers",
        value: "2,847",
        change: "-2.4%",
        changeType: "decrease",
        icon: Users,
        color: "#F59E0B",
      },
    ],
    []
  );

  const [translatedOrders, setTranslatedOrders] = useState<any[]>([]);
  const [translatedProducts, setTranslatedProducts] = useState<any[]>([]);
  const [translatedStatusMap, setTranslatedStatusMap] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const translateAllContent = async () => {
      // 1. JIKA BAHASA INDONESIA (Manual Mapping agar cepat & akurat)
      if (language === "id") {
        setUiText({
          dashboardTitle: "Dasbor",
          dashboardSubtitle:
            "Selamat datang kembali! Inilah situasi toko roti Anda.",
          vsLastMonth: "vs bulan lalu",
          recentOrders: "Pesanan Terbaru",
          viewAllOrders: "Lihat Semua Pesanan",
          topProducts: "Produk Terlaris",
          quickActions: "Aksi Cepat",
          addProduct: "Tambah Produk",
          viewKasir: "Lihat Kasir",
          manageUsers: "Kelola Pengguna",
          viewReports: "Lihat Laporan",
          minutesAgo: "menit lalu",
          hoursAgo: "jam lalu",
          daysAgo: "hari lalu",
          sales: "penjualan",
          stock: "Stok",
        });

        // Mapping Status
        setTranslatedStatusMap({
          completed: "Selesai",
          baked: "Dipanggang",
          paid: "Dibayar",
          verifying: "Memverifikasi",
          pending: "Tertunda",
        });

        // Mapping Stats Titles
        setApiTranslations({
          "Total Revenue": "Total Pendapatan",
          "Total Orders": "Total Pesanan",
          "Total Products": "Total Produk",
          "Total Customers": "Total Pelanggan",
        });

        // Data Dinamis
        setTranslatedOrders(
          recentOrders.map((order) => ({
            ...order,
            displayText: `${order.customer} (${order.customerPhone}) • ${order.product} (${order.quantity}x)`,
          }))
        );
        setTranslatedProducts(
          topProducts.map((product) => ({
            ...product,
            displayText: `${product.sales} penjualan • Stok: ${product.stok}`,
          }))
        );
        return;
      }

      // 2. JIKA BAHASA LAIN (Gunakan API)
      try {
        // A. Translate UI Text (Header, Buttons, etc)
        const uiKeys = Object.keys(uiText);
        const uiValues = Object.values(uiText); // Mengambil nilai default Inggris

        // Kita fetch translate untuk setiap value default UI
        const translatedUiValues = await Promise.all(
          uiValues.map((text) =>
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, targetLanguage: language }),
            })
              .then((r) => r.json())
              .then((d) => d.translatedText || text)
          )
        );

        // Gabungkan kembali ke object state
        const newUiText: any = {};
        uiKeys.forEach((key, index) => {
          newUiText[key] = translatedUiValues[index];
        });
        setUiText(newUiText);

        // B. Translate Stats Titles
        stats.forEach(async (stat) => {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: stat.key, targetLanguage: language }),
          }).then((r) => r.json());

          if (res.translatedText) {
            setApiTranslations((prev) => ({
              ...prev,
              [stat.key]: res.translatedText,
            }));
          }
        });

        // C. Translate Status Map
        const statusKeys = [
          "Completed",
          "Baked",
          "Paid",
          "Verifying",
          "Pending",
        ];
        const statusRes = await Promise.all(
          statusKeys.map((s) =>
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: s, targetLanguage: language }),
            }).then((r) => r.json())
          )
        );

        setTranslatedStatusMap({
          completed: statusRes[0].translatedText || "Completed",
          baked: statusRes[1].translatedText || "Baked",
          paid: statusRes[2].translatedText || "Paid",
          verifying: statusRes[3].translatedText || "Verifying",
          pending: statusRes[4].translatedText || "Pending",
        });

        // D. Translate Orders & Products (Dynamic Data)
        // Translate Order Info
        const ordersTranslated = await Promise.all(
          recentOrders.map((order) =>
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: `${order.customer} • ${order.product}`,
                targetLanguage: language,
              }),
            })
              .then((r) => r.json())
              .then((d) => ({
                displayText: `${
                  d.translatedText || `${order.customer} • ${order.product}`
                } (${order.quantity}x)`,
              }))
          )
        );

        // Translate Product Info
        const productsTranslated = await Promise.all(
          topProducts.map((product) =>
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: `${product.sales} sales • Stock: ${product.stok}`,
                targetLanguage: language,
              }),
            })
              .then((r) => r.json())
              .then((d) => ({
                displayText:
                  d.translatedText ||
                  `${product.sales} sales • Stock: ${product.stok}`,
              }))
          )
        );

        setTranslatedOrders(
          recentOrders.map((order, index) => ({
            ...order,
            displayText: ordersTranslated[index].displayText,
          }))
        );
        setTranslatedProducts(
          topProducts.map((product, index) => ({
            ...product,
            displayText: productsTranslated[index].displayText,
          }))
        );
      } catch (error) {
        console.error("[v0] Translation error:", error);
      }
    };

    translateAllContent();
  }, [language]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        router.push("/admin/products");
        break;
      case "view-kasir":
        router.push("/admin/kasir");
        break;
      case "manage-users":
        router.push("/admin/users");
        break;
      case "view-reports":
        router.push("/admin/dashboard");
        break;
      default:
        break;
    }
  };

  const getStatusDisplay = (status: string) => {
    return translatedStatusMap[status] || status;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "text-white";
      case "baked":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "verifying":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const timeAgo = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${uiText.minutesAgo}`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ${uiText.hoursAgo}`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ${uiText.daysAgo}`;
    }
  };

  const getRankBadge = (index: number) => {
    const badges = [
      { bg: "#FCD34D", text: "#78350F", label: "🥇" },
      { bg: "#E5E7EB", text: "#374151", label: "🥈" },
      { bg: "#FED7AA", text: "#7C2D12", label: "🥉" },
      { bg: "#93C5FD", text: "#1E3A8A", label: "4th" },
    ];
    return badges[index] || badges[3];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl p-8 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            {/* Menggunakan state uiText untuk Title */}
            <h1 className="text-3xl font-bold font-admin-heading text-white">
              {uiText.dashboardTitle}
            </h1>
            {/* Menggunakan state uiText untuk Subtitle */}
            <p className="font-admin-body text-white/90 mt-2">
              {uiText.dashboardSubtitle}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-admin-body bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString(
                language === "id" ? "id-ID" : "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const getBgColor = () => {
            if (stat.color === "#10B981") return "bg-green-50/80";
            if (stat.color === "#3B82F6") return "bg-blue-50/80";
            if (stat.color === "#8B5CF6") return "bg-purple-50/80";
            return "bg-orange-50/80";
          };
          const getBorderColor = () => {
            if (stat.color === "#10B981") return "#A7F3D0";
            if (stat.color === "#3B82F6") return "#BFDBFE";
            if (stat.color === "#8B5CF6") return "#DDD6FE";
            return "#FDE68A";
          };
          const getIconBg = () => {
            if (stat.color === "#10B981") return "#6EE7B7";
            if (stat.color === "#3B82F6") return "#93C5FD";
            if (stat.color === "#8B5CF6") return "#C4B5FD";
            return "#FCD34D";
          };

          const displayText =
            apiTranslations[stat.key] || tAdminSync(stat.title);

          return (
            <div
              key={index}
              className={`${getBgColor()} rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300`}
              style={{ borderColor: getBorderColor() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-admin-body text-gray-600">
                    {displayText}
                  </p>
                  <p className="text-2xl font-bold mt-2 font-admin-heading text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium font-admin-body ${
                        stat.changeType === "increase"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 font-admin-body">
                      {uiText.vsLastMonth}
                    </span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-xl shadow-sm"
                  style={{ backgroundColor: getIconBg() }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200/60 hover:shadow-md transition-all duration-300">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold font-admin-heading text-gray-900">
                {uiText.recentOrders}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {translatedOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-sm transition-all duration-200"
                  style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium font-admin-heading text-gray-900">
                        #{order.id}
                      </p>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full font-admin-body shadow-sm ${getStatusStyle(
                          order.status
                        )}`}
                        style={
                          order.status === "completed"
                            ? { backgroundColor: "#10B981", color: "white" }
                            : {}
                        }
                      >
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <p className="text-sm font-admin-body text-gray-600">
                      {order.displayText} ({order.customerPhone})
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold font-admin-heading text-gray-900">
                        Rp {order.amount.toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 font-admin-body">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeAgo(order.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full text-center py-2 px-4 text-sm font-medium transition-all duration-200 font-admin-body bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-sm">
                {uiText.viewAllOrders}
              </button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-200/60 hover:shadow-md transition-all duration-300">
          <div className="px-6 py-4 border-b border-purple-100 bg-purple-50/50">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold font-admin-heading text-gray-900">
                {uiText.topProducts}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {translatedProducts.map((product, index) => {
                const badge = getRankBadge(index);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border-2 hover:shadow-sm transition-all duration-200"
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-sm"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </div>
                      <div>
                        <p className="font-medium font-admin-heading text-gray-900">
                          {product.nama}
                        </p>
                        <p className="text-sm font-admin-body text-gray-600">
                          {product.displayText}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-admin-heading text-gray-900">
                        Rp {product.revenue.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200/60 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <h2 className="text-lg font-semibold font-admin-heading text-gray-900">
            {uiText.quickActions}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction("add-product")}
            className="flex flex-col items-center p-6 rounded-xl bg-purple-400 hover:bg-purple-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Package className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {uiText.addProduct}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction("view-kasir")}
            className="flex flex-col items-center p-6 rounded-xl bg-blue-400 hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <ShoppingCart className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {uiText.viewKasir}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction("manage-users")}
            className="flex flex-col items-center p-6 rounded-xl bg-orange-400 hover:bg-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Users className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {uiText.manageUsers}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction("view-reports")}
            className="flex flex-col items-center p-6 rounded-xl bg-green-400 hover:bg-green-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {uiText.viewReports}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
