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
import { Modal } from "@/components/adminPage/Modal";
import { AddProductModal } from "@/components/adminPage/productsPage/AddProductModal";
import { AddUserModal } from "@/components/adminPage/users/AddUserModal";
import { WhatsAppBlastModal } from "@/components/adminPage/customersPage/WhatsAppBlastModal";
import { useProducts } from "@/app/contexts/ProductsContext";
import { useAdmin } from "@/app/contexts/UsersContext";
import { useToast } from "@/app/contexts/ToastContext";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  titleKey: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useAdminTranslation();
  const { addProduct } = useProducts();
  const { createAdmin } = useAdmin();
  const { addToast } = useToast();

  const [activeModal, setActiveModal] = useState<
    "addProduct" | "addUser" | "waBlast" | null
  >(null);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (response.ok) {
          const data = await response.json();
          setRoles(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };
    fetchRoles();
  }, []);

  // State untuk data real dari API
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentOrdersData, setRecentOrdersData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data Real dari API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Stats
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        if (statsData.success) {
          setDashboardStats(statsData.data);
        }

        // 2. Fetch Recent Orders (Ambil 5 teratas)
        const ordersRes = await fetch("/api/orders");
        const ordersData = await ordersRes.json();
        if (ordersData.data) {
          // Sort by created_at desc dan ambil 5
          const sortedOrders = ordersData.data
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5);
          setRecentOrdersData(sortedOrders);
        }

        // 3. Fetch Top Products (Ambil 5 teratas berdasarkan sales/stok sementara)
        const productsRes = await fetch("/api/products");
        const productsData = await productsRes.json();
        if (productsData.data) {
          // Mock logic: sort by stok (karena belum ada field sales di response product list biasa)
          const sortedProducts = productsData.data
            .sort((a: any, b: any) => (b.stok || 0) - (a.stok || 0))
            .slice(0, 5);
          setTopProductsData(sortedProducts);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats: StatCard[] = useMemo(() => {
    if (!dashboardStats) return [];

    return [
      {
        title: t("dashboard.totalRevenue"),
        titleKey: "dashboard.totalRevenue",
        value: `Rp ${parseInt(dashboardStats.total_revenue || 0).toLocaleString(
          "id-ID"
        )}`,
        change: dashboardStats.revenue_growth
          ? `${dashboardStats.revenue_growth > 0 ? "+" : ""}${
              dashboardStats.revenue_growth
            }%`
          : "+0%",
        changeType:
          (dashboardStats.revenue_growth || 0) >= 0 ? "increase" : "decrease",
        icon: DollarSign,
        color: "#10B981",
      },
      {
        title: t("dashboard.totalOrders"),
        titleKey: "dashboard.totalOrders",
        value: dashboardStats.total_orders?.toString() || "0",
        change: dashboardStats.orders_growth
          ? `${dashboardStats.orders_growth > 0 ? "+" : ""}${
              dashboardStats.orders_growth
            }%`
          : "+0%",
        changeType:
          (dashboardStats.orders_growth || 0) >= 0 ? "increase" : "decrease",
        icon: ShoppingCart,
        color: "#3B82F6",
      },
      {
        title: t("dashboard.totalProducts"),
        titleKey: "dashboard.totalProducts",
        value: dashboardStats.total_products?.toString() || "0",
        change: "+0%", // Backend belum kirim growth produk
        changeType: "increase",
        icon: Package,
        color: "#8B5CF6",
      },
      {
        title: t("dashboard.totalCustomers"),
        titleKey: "dashboard.totalCustomers",
        value: dashboardStats.total_customers?.toString() || "0",
        change: dashboardStats.customers_growth
          ? `${dashboardStats.customers_growth > 0 ? "+" : ""}${
              dashboardStats.customers_growth
            }%`
          : "+0%",
        changeType:
          (dashboardStats.customers_growth || 0) >= 0 ? "increase" : "decrease",
        icon: Users,
        color: "#F59E0B",
      },
    ];
  }, [dashboardStats, t]);

  // Helper function untuk translate status menggunakan static translations
  const getStatusDisplay = (status: string) => {
    const statusKey = `status.${status}` as const;
    return t(statusKey);
  };

  // Helper function untuk format waktu relatif
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${t("dashboard.minutesAgo")}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t("dashboard.hoursAgo")}`;
    } else {
      return `${diffDays} ${t("dashboard.daysAgo")}`;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        setActiveModal("addProduct");
        break;
      case "manage-users":
        setActiveModal("addUser");
        break;
      case "wa-blast":
        setActiveModal("waBlast");
        break;
      default:
        break;
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await addProduct(productData);
      addToast({
        type: "success",
        title: "Success",
        message: "Product added successfully",
      });
      setActiveModal(null);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to add product",
      });
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      // Map role string to ID
      const roleObj = roles.find(
        (r) => r.name.toLowerCase() === userData.role.toLowerCase()
      );
      // Fallback IDs: 1=Owner, 2=Admin, 3=Customer/Member? Need to check DB but fallback is better than crash
      const roleId = roleObj ? roleObj.id : userData.role === "admin" ? 2 : 3;

      await createAdmin({
        nama: userData.name,
        no_hp: userData.phone,
        role_ids: [roleId],
        password: userData.password,
      });

      addToast({
        type: "success",
        title: "Success",
        message: "User added successfully",
      });
      setActiveModal(null);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to add user",
      });
    }
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
            <h1 className="text-3xl font-bold font-admin-heading text-white">
              {t("dashboard.title")}
            </h1>
            <p className="font-admin-body text-white/90 mt-2">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-admin-body bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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

          return (
            <div
              key={index}
              className={`${getBgColor()} rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300`}
              style={{ borderColor: getBorderColor() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-admin-body text-gray-600">
                    {stat.title}
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
                      {t("dashboard.vsLastMonth")}
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
                {t("dashboard.recentOrders")}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrdersData.map((order, index) => (
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
                      {order.customer?.nama || "Guest"} ({order.customer?.no_hp || "-"}) • {order.items?.[0]?.productName || "Item"} ({order.items?.[0]?.quantity || 1}x)
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold font-admin-heading text-gray-900">
                        Rp{" "}
                        {(
                          order.total_amount ||
                          order.amount ||
                          0
                        ).toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 font-admin-body">
                        <Clock className="w-3 h-3 mr-1" />
                        {getRelativeTime(order.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full text-center py-2 px-4 text-sm font-medium transition-all duration-200 font-admin-body bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-sm">
                {t("dashboard.viewAllOrders")}
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
                {t("dashboard.topProducts")}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProductsData.map((product, index) => {
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
                          {product.nama || product.name}
                        </p>
                        <p className="text-sm font-admin-body text-gray-600">
                          {product.sales || 0} {t("dashboard.sales")} • {t("dashboard.stock")}: {product.stok}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-admin-heading text-gray-900">
                        Rp{" "}
                        {(
                          product.revenue ||
                          product.harga ||
                          product.price ||
                          0
                        ).toLocaleString("id-ID")}
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
            {t("dashboard.quickActions")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction("add-product")}
            className="flex flex-col items-center p-6 rounded-xl bg-purple-400 hover:bg-purple-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Package className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {t("dashboard.addProduct")}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction("manage-users")}
            className="flex flex-col items-center p-6 rounded-xl bg-orange-400 hover:bg-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Users className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {t("dashboard.manageUsers")}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction("wa-blast")}
            className="flex flex-col items-center p-6 rounded-xl bg-green-400 hover:bg-green-500 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            <TrendingUp className="w-8 h-8 mb-2 text-white" />
            <span className="text-sm font-medium font-admin-body text-white">
              {t("dashboard.waBlast")}
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={activeModal === "addProduct"}
        onClose={() => setActiveModal(null)}
        onAddProduct={handleAddProduct}
      />

      <AddUserModal
        isOpen={activeModal === "addUser"}
        onClose={() => setActiveModal(null)}
        onAddUser={handleAddUser}
        roles={roles}
      />

      <WhatsAppBlastModal
        isOpen={activeModal === "waBlast"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
