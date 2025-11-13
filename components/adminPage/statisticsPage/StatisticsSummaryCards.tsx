"use client"
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"
import type { CustomerStatistics, MonthlySalesData } from "@/app/contexts/StatisticsContext"

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
  const summaryCards = [
    {
      title: "Total Revenue",
      value: `Rp ${(totalRevenue / 1000000).toFixed(1)}M`,
      subtitle: "All time sales",
      icon: DollarSign,
      color: "#8b6f47",
      bgColor: "#f9f7f4",
    },
    {
      title: "Total Sales",
      value: totalSales.toString(),
      subtitle: "Items sold",
      icon: ShoppingCart,
      color: "#9B6D49",
      bgColor: "#f9f7f4",
    },
    {
      title: "Avg Monthly Revenue",
      value: `Rp ${(averageMonthlyRevenue / 1000000).toFixed(1)}M`,
      subtitle: `Highest: ${highestMonth.month}`,
      icon: TrendingUp,
      color: "#5d4037",
      bgColor: "#f9f7f4",
    },
    {
      title: "Repeat Customers",
      value: customerStats.repeatCustomers.toString(),
      subtitle: `${((customerStats.repeatCustomers / customerStats.totalCustomers) * 100).toFixed(0)}% of total`,
      icon: Users,
      color: "#7b5235",
      bgColor: "#f9f7f4",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium font-admin-body" style={{ color: "#8b6f47" }}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold mt-2 font-admin-heading" style={{ color: "#5d4037" }}>
                  {card.value}
                </p>
                <p className="text-xs mt-2 font-admin-body" style={{ color: "#999" }}>
                  {card.subtitle}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: card.bgColor }}>
                <Icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
