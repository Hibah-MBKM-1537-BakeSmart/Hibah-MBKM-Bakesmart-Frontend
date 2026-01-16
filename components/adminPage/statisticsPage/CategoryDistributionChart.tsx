"use client"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import type { CategorySalesData } from "@/app/contexts/StatisticsContext"
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext"

interface CategoryDistributionChartProps {
  data: CategorySalesData[]
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const { t } = useAdminTranslation()
  const COLORS = ["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#10B981", "#EC4899", "#14B8A6"]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold font-admin-heading" style={{ color: "#5d4037" }}>
          {t("statistics.categoryDistribution")}
        </h2>
        <p className="text-xs mt-1 font-admin-body" style={{ color: "#8b6f47" }}>
          {t("statistics.salesByCategory")}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage}%`}
            outerRadius={90}
            innerRadius={50}
            fill="#8884d8"
            dataKey="sales"
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "2px solid #E5E7EB",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Details */}
      <div className="mt-6 space-y-3">
        {data.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm font-admin-body" style={{ color: "#5d4037" }}>
                {category.category}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium font-admin-heading" style={{ color: "#5d4037" }}>
                {category.sales} {t("statistics.salesLabel")}
              </span>
              <span
                className="text-sm font-admin-body px-2 py-1 rounded"
                style={{ backgroundColor: "#f9f7f4", color: "#8b6f47" }}
              >
                {category.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
