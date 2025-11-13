"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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

// Mock data generator
const generateMonthlySalesData = (): MonthlySalesData[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month, index) => ({
    month,
    sales: Math.floor(Math.random() * 500) + 200,
    revenue: Math.floor(Math.random() * 50000000) + 10000000,
    orders: Math.floor(Math.random() * 100) + 30,
  }));
};

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

const customerStatsData: CustomerStatistics = {
  totalCustomers: 2847,
  newCustomers: 342,
  repeatCustomers: 1205,
  averageOrderValue: 156750,
};

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StatisticsState>({
    monthlySalesData: [],
    categorySalesData: categoryData,
    topProducts: topProductsData,
    customerStats: customerStatsData,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const initializeData = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setState((prev) => ({
          ...prev,
          monthlySalesData: generateMonthlySalesData(),
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load statistics",
        }));
      }
    };

    initializeData();
  }, []);

  const refreshStatistics = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setState((prev) => ({
        ...prev,
        monthlySalesData: generateMonthlySalesData(),
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to refresh statistics",
      }));
    }
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

export function useStatistics(): StatisticsContextType {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }
  return context;
}
