"use client"
import { Package, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ProductPerformance } from "@/app/contexts/StatisticsContext"

interface TopProductsCardProps {
  products: ProductPerformance[]
}

export function TopProductsCard({ products }: TopProductsCardProps) {
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
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-admin-heading" style={{ color: "#5d4037" }}>
          Top Performing Products
        </h2>
        <Package className="w-5 h-5" style={{ color: "#8b6f47" }} />
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: "#f9f7f4" }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="text-sm font-bold font-admin-heading px-2 py-1 rounded"
                style={{ backgroundColor: "#8b6f47", color: "white" }}
              >
                #{index + 1}
              </div>
              <div>
                <p className="font-medium font-admin-heading" style={{ color: "#5d4037" }}>
                  {product.name}
                </p>
                <p className="text-sm font-admin-body" style={{ color: "#8b6f47" }}>
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
        ))}
      </div>
    </div>
  )
}
