"use client"
import { Package, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ProductPerformance } from "@/app/contexts/StatisticsContext"
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext"

interface TopProductsCardProps {
  products: ProductPerformance[]
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  const { t } = useAdminTranslation()

  const getBadgeColor = (index: number) => {
    const colors = [
      { bg: "#FCD34D", text: "#78350F", border: "#F59E0B", name: "Gold" },
      { bg: "#E5E7EB", text: "#374151", border: "#9CA3AF", name: "Silver" },
      { bg: "#FED7AA", text: "#7C2D12", border: "#F97316", name: "Bronze" },
      { bg: "#93C5FD", text: "#1E3A8A", border: "#3B82F6", name: "Blue" },
      { bg: "#6EE7B7", text: "#064E3B", border: "#10B981", name: "Green" },
    ]
    return colors[index] || colors[4]
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "stable":
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      case "stable":
        return "text-gray-600"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-admin-heading text-gray-900">
          {t("statistics.topProducts")}
        </h2>
        <Package className="w-5 h-5 text-blue-600" />
      </div>

      <div className="space-y-4">
        {products.map((product, index) => {
          const badgeColor = getBadgeColor(index)
          return (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: "#F9FAFB", borderColor: badgeColor.border }}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="text-sm font-bold font-admin-heading px-3 py-1.5 rounded-lg shadow-sm"
                  style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium font-admin-heading text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-sm font-admin-body text-gray-600">
                    {product.sales} sales • Rp {(product.revenue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(product.trend)}`}>
                {getTrendIcon(product.trend)}
                <span className="text-sm font-medium font-admin-body">
                  {product.trendPercentage > 0 ? "+" : ""}
                  {product.trendPercentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
