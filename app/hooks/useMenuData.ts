"use client";

import { useState, useEffect } from "react";
import { MenuAPI } from "@/lib/api/menuApi";
import type { MenuItem, ProductType } from "@/lib/api/mockData";

interface UseMenuDataProps {
  category?: string;
  day?: string;
  bestSeller?: boolean;
}

export function useMenuData(filters?: UseMenuDataProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("[v0] Fetching menu items with filters:", filters);
      const response = await MenuAPI.getMenuItems(filters);
      if (response.success) {
        console.log(
          "[v0] Menu items fetched successfully:",
          response.data.length,
          "items"
        );
        setMenuItems(response.data);
      } else {
        console.log("[v0] Failed to fetch menu items:", response.message);
        setError(response.message || "Failed to fetch menu items");
      }
    } catch (err) {
      console.log("[v0] Network error occurred:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await MenuAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [filters?.category, filters?.day, filters?.bestSeller]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchMenuItems();
  };

  return {
    menuItems,
    categories,
    loading,
    error,
    refetch,
  };
}

export function useBestSellers() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("[v0] Fetching best sellers");
        const response = await MenuAPI.getBestSellers();
        if (response.success) {
          console.log(
            "[v0] Best sellers fetched successfully:",
            response.data.length,
            "items"
          );
          setBestSellers(response.data);
        } else {
          console.log("[v0] Failed to fetch best sellers:", response.message);
          setError(response.message || "Failed to fetch best sellers");
        }
      } catch (err) {
        console.log("[v0] Network error occurred:", err);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return { bestSellers, loading, error };
}
