"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useStatistics } from "@/app/contexts/StatisticsContext";
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";
import {
  StatisticsSummaryCards,
  MonthlySalesChart,
  CategoryDistributionChart,
  TopProductsCard,
  CustomerStatisticsCard,
} from "@/components/adminPage/statisticsPage";

export default function StatisticsPage() {
  const { state, refreshStatistics } = useStatistics();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useAdminTranslation();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatistics();
    setIsRefreshing(false);
  };

  // Use data from backend
  const totalRevenue = state.totalRevenue || state.monthlySalesData.reduce(
    (sum, month) => sum + month.revenue,
    0
  );
  const totalSales = state.totalSales || state.topProducts.reduce(
    (sum, product) => sum + product.sales,
    0
  );
  const averageMonthlyRevenue =
    state.monthlySalesData.length > 0
      ? totalRevenue / state.monthlySalesData.length
      : 0;
  const highestMonth = state.monthlySalesData.reduce(
    (prev, current) => (current.revenue > prev.revenue ? current : prev),
    state.monthlySalesData[0] || { month: "N/A", revenue: 0, sales: 0, orders: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold font-admin-heading"
            style={{ color: "#5d4037" }}
          >
            {t("statistics.title")}
          </h1>
          <p className="font-admin-body mt-1" style={{ color: "#8b6f47" }}>
            {t("statistics.subtitle")}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-admin-body disabled:opacity-50"
          style={{
            backgroundColor: "#8b6f47",
            color: "white",
          }}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? t("statistics.refreshing") : t("statistics.refreshData")}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <StatisticsSummaryCards
        totalRevenue={totalRevenue}
        totalSales={totalSales}
        averageMonthlyRevenue={averageMonthlyRevenue}
        highestMonth={highestMonth}
        customerStats={state.customerStats}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <MonthlySalesChart data={state.monthlySalesData} />

        {/* Category Distribution Chart */}
        <CategoryDistributionChart data={state.categorySalesData} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <TopProductsCard products={state.topProducts} />

        {/* Customer Statistics */}
        <CustomerStatisticsCard stats={state.customerStats} />
      </div>

      {/* Additional Info */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-admin-body">{state.error}</p>
        </div>
      )}
    </div>
  );
}
