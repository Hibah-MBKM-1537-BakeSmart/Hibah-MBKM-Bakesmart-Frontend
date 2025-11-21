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
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      label: "New Customers",
      value: stats.newCustomers,
      icon: UserPlus,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      label: "Repeat Customers",
      value: stats.repeatCustomers,
      icon: Repeat2,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
    {
      label: "Avg. Order Value",
      value: `Rp ${(stats.averageOrderValue / 1000).toFixed(0)}K`,
      icon: ShoppingCart,
      color: "#F59E0B",
      bgColor: "#FFF7ED",
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300" style={{ borderColor: "#E5E7EB" }}>
      <h2 className="text-lg font-semibold mb-6 font-admin-heading text-gray-900">
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
              className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all duration-200"
              style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: metric.bgColor }}>
                  <Icon className="w-6 h-6" style={{ color: metric.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium font-admin-body text-gray-600">
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold font-admin-heading text-gray-900">
                    {metric.value}
                  </p>
                </div>
              </div>
              {repeatRate && (
                <span
                  className="text-sm font-medium px-3 py-1.5 rounded-full border-2 shadow-sm"
                  style={{ backgroundColor: "#F5F3FF", borderColor: "#C4B5FD", color: "#8B5CF6" }}
                >
                  {repeatRate}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 p-4 rounded-lg border-2" style={{ backgroundColor: "#F5F3FF", borderColor: "#C4B5FD" }}>
        <p className="text-sm font-admin-body text-gray-700">
          💡 <strong className="text-purple-700">{((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(0)}%</strong> of your customers are
          repeat buyers, indicating strong customer loyalty!
        </p>
      </div>
    </div>
  )
}
