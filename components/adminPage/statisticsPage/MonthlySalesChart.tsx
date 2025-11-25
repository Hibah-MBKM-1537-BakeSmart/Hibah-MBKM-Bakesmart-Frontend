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
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
          <XAxis dataKey="month" stroke="#6366F1" style={{ fontSize: '12px', fontWeight: 500 }} />
          <YAxis yAxisId="left" stroke="#3B82F6" style={{ fontSize: '12px', fontWeight: 500 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" style={{ fontSize: '12px', fontWeight: 500 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "2px solid #E0E7FF",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            yAxisId="left" 
            dataKey="sales" 
            fill="url(#colorSales)" 
            name="Sales (units)" 
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            yAxisId="right" 
            dataKey="revenueM" 
            fill="url(#colorRevenue)" 
            name="Revenue (Millions Rp)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
