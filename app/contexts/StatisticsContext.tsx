"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const BACKEND_API_URL = "/api/dashboard/stats";

export interface MonthlySalesData {
  month: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
  percentage: number;
}

export interface ProductPerformance {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
}

interface StatisticsState {
  monthlySalesData: MonthlySalesData[];
  categorySalesData: CategorySalesData[];
  topProducts: ProductPerformance[];
  customerStats: CustomerStatistics;
  totalRevenue: number;
  totalSales: number;
  loading: boolean;
  error: string | null;
}

interface StatisticsContextType {
  state: StatisticsState;
  refreshStatistics: () => Promise<void>;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(
  undefined
);

// Mock/fallback data
const categoryData: CategorySalesData[] = [
  { category: "Cakes", sales: 420, percentage: 35 },
  { category: "Cupcakes", sales: 280, percentage: 23 },
  { category: "Pastries", sales: 210, percentage: 18 },
  { category: "Donuts", sales: 234, percentage: 20 },
  { category: "Others", sales: 56, percentage: 4 },
];

const topProductsData: ProductPerformance[] = [
  {
    id: 1,
    name: "Chocolate Cake",
    sales: 145,
    revenue: 18125000,
    trend: "up",
    trendPercentage: 12.5,
  },
  {
    id: 5,
    name: "Donuts Box (12 pcs)",
    sales: 234,
    revenue: 14040000,
    trend: "up",
    trendPercentage: 8.2,
  },
  {
    id: 2,
    name: "Red Velvet Cupcakes",
    sales: 89,
    revenue: 1335000,
    trend: "stable",
    trendPercentage: 0,
  },
  {
    id: 4,
    name: "Birthday Cake",
    sales: 67,
    revenue: 13400000,
    trend: "down",
    trendPercentage: -3.1,
  },
  {
    id: 6,
    name: "Cheese Tart",
    sales: 78,
    revenue: 1950000,
    trend: "up",
    trendPercentage: 5.3,
  },
];

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StatisticsState>({
    monthlySalesData: [],
    categorySalesData: categoryData,
    topProducts: topProductsData,
    customerStats: {
      totalCustomers: 0,
      newCustomers: 0,
      repeatCustomers: 0,
      averageOrderValue: 0,
    },
    totalRevenue: 0,
    totalSales: 0,
    loading: false,
    error: null,
  });

  const fetchStatistics = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.data) {
        throw new Error("Invalid response format");
      }

      const backendData = result.data;

      // Transform sales_and_revenue to monthly data
      const monthlySalesData: MonthlySalesData[] = backendData.sales_and_revenue?.map((item: any) => ({
        month: getMonthName(item.month),
        sales: parseInt(item.sales) || 0,
        revenue: parseInt(item.revenue) || 0,
        orders: parseInt(item.sales) || 0, // Using sales as orders count
      })) || [];

      // Transform customer statistics
      const customerStats: CustomerStatistics = {
        totalCustomers: parseInt(backendData.total_customer) || 0,
        newCustomers: parseInt(backendData.new_customer) || 0,
        repeatCustomers: parseInt(backendData.repeat_customer) || 0,
        averageOrderValue: parseFloat(backendData.avg_order_value) || 0,
      };

      setState((prev) => ({
        ...prev,
        monthlySalesData,
        customerStats,
        totalRevenue: parseInt(backendData.total_revenue) || 0,
        totalSales: parseInt(backendData.total_sales) || 0,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Error fetching statistics:", error);
      
      let errorMessage = "Gagal memuat statistik";
      if (error.name === "AbortError") {
        errorMessage = "Koneksi timeout, coba lagi";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const refreshStatistics = async (): Promise<void> => {
    await fetchStatistics();
  };

  const contextValue: StatisticsContextType = {
    state,
    refreshStatistics,
  };

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
}

// Helper function to convert month number to name
function getMonthName(monthNum: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const index = parseInt(monthNum) - 1;
  return months[index] || monthNum;
}

export function useStatistics(): StatisticsContextType {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }
  return context;
}
