"use client"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import type { CategorySalesData } from "@/app/contexts/StatisticsContext"

interface CategoryDistributionChartProps {
  data: CategorySalesData[]
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const COLORS = ["#8b6f47", "#9B6D49", "#7b5235", "#5d4037", "#c9a876"]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold font-admin-heading" style={{ color: "#5d4037" }}>
          Category Distribution
        </h2>
        <p className="text-xs mt-1 font-admin-body" style={{ color: "#8b6f47" }}>
          Sales breakdown by product category
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
            outerRadius={80}
            fill="#8884d8"
            dataKey="sales"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#f9f7f4",
              border: "1px solid #e0d5c7",
              borderRadius: "8px",
            }}
          />
          <Legend />
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
                {category.sales} sales
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
