"use client"
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"
import type { CustomerStatistics, MonthlySalesData } from "@/app/contexts/StatisticsContext"
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext"

interface StatisticsSummaryCardsProps {
  totalRevenue: number
  totalSales: number
  averageMonthlyRevenue: number
  highestMonth: MonthlySalesData
  customerStats: CustomerStatistics
}

export function StatisticsSummaryCards({
  totalRevenue,
  totalSales,
  averageMonthlyRevenue,
  highestMonth,
  customerStats,
}: StatisticsSummaryCardsProps) {
  const { t } = useAdminTranslation()

  // Format currency to full Rupiah with thousand separators
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const summaryCards = [
    {
      title: t("statistics.totalRevenue"),
      value: formatRupiah(totalRevenue),
      subtitle: t("statistics.allTimeSales"),
      icon: DollarSign,
      color: "#10B981",
      bgColor: "#ECFDF5",
      borderColor: "#6EE7B7",
    },
    {
      title: t("statistics.totalSales"),
      value: totalSales.toString(),
      subtitle: t("statistics.itemsSold"),
      icon: ShoppingCart,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      borderColor: "#93C5FD",
    },
    {
      title: t("statistics.avgMonthlyRevenue"),
      value: formatRupiah(averageMonthlyRevenue),
      subtitle: `${t("statistics.highest")}: ${highestMonth.month}`,
      icon: TrendingUp,
      color: "#F59E0B",
      bgColor: "#FFF7ED",
      borderColor: "#FCD34D",
    },
    {
      title: t("statistics.repeatCustomers"),
      value: customerStats.repeatCustomers.toString(),
      subtitle: `${((customerStats.repeatCustomers / customerStats.totalCustomers) * 100).toFixed(0)}% ${t("statistics.ofTotal")}`,
      icon: Users,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      borderColor: "#C4B5FD",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300" style={{ borderColor: card.borderColor }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium font-admin-body text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold mt-2 font-admin-heading text-gray-900">
                  {card.value}
                </p>
                <p className="text-xs mt-2 font-admin-body text-gray-500">
                  {card.subtitle}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: card.bgColor }}>
                <Icon className="w-7 h-7" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
