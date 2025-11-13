"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { MonthlySalesData } from "@/app/contexts/StatisticsContext"

interface MonthlySalesChartProps {
  data: MonthlySalesData[]
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  // Transform revenue to millions for better readability
  const chartData = data.map((item) => ({
    ...item,
    revenueM: Math.round(item.revenue / 1000000),
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: "#e0d5c7" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-admin-heading" style={{ color: "#5d4037" }}>
          Monthly Sales & Revenue
        </h2>
        <span
          className="text-xs font-admin-body px-3 py-1 rounded-full"
          style={{ backgroundColor: "#f9f7f4", color: "#8b6f47" }}
        >
          Last 12 months
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0d5c7" />
          <XAxis dataKey="month" stroke="#8b6f47" />
          <YAxis yAxisId="left" stroke="#8b6f47" />
          <YAxis yAxisId="right" orientation="right" stroke="#9B6D49" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f9f7f4",
              border: "1px solid #e0d5c7",
              borderRadius: "8px",
            }}
            cursor={{ fill: "rgba(139, 111, 71, 0.1)" }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="sales" fill="#8b6f47" name="Sales (units)" />
          <Bar yAxisId="right" dataKey="revenueM" fill="#9B6D49" name="Revenue (Millions Rp)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
