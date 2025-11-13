"use client"
import { Users, UserPlus, Repeat2, ShoppingCart } from "lucide-react"
import type { CustomerStatistics } from "@/app/contexts/StatisticsContext"

interface CustomerStatisticsCardProps {
  stats: CustomerStatistics
}

export function CustomerStatisticsCard({ stats }: CustomerStatisticsCardProps) {
  const metrics = [
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "#8b6f47",
    },
    {
      label: "New Customers",
      value: stats.newCustomers,
      icon: UserPlus,
      color: "#9B6D49",
    },
    {
      label: "Repeat Customers",
      value: stats.repeatCustomers,
      icon: Repeat2,
      color: "#5d4037",
    },
    {
      label: "Avg. Order Value",
      value: `Rp ${(stats.averageOrderValue / 1000).toFixed(0)}K`,
      icon: ShoppingCart,
      color: "#7b5235",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
      <h2 className="text-lg font-semibold mb-6 font-admin-heading" style={{ color: "#5d4037" }}>
        Customer Insights
      </h2>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const repeatRate =
            metric.label === "Repeat Customers"
              ? `${((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(0)}%`
              : null

          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: "#f9f7f4" }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#e8dfd5" }}>
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium font-admin-body" style={{ color: "#8b6f47" }}>
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold font-admin-heading" style={{ color: "#5d4037" }}>
                    {metric.value}
                  </p>
                </div>
              </div>
              {repeatRate && (
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#fff", border: "1px solid #e0d5c7", color: "#8b6f47" }}
                >
                  {repeatRate}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#f9f7f4" }}>
        <p className="text-xs font-admin-body" style={{ color: "#8b6f47" }}>
          💡 <strong>{((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(0)}%</strong> of your customers are
          repeat buyers, indicating strong customer loyalty!
        </p>
      </div>
    </div>
  )
}
