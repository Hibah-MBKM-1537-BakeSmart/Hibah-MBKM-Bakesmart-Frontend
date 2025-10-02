"use client"

import { useState, useEffect } from "react"
import { MenuAPI } from "@/lib/api/menuApi"
import type { MenuItem, Category } from "@/lib/api/mockData"

interface UseMenuDataProps {
  category?: string
  day?: string
  bestSeller?: boolean
}

export function useMenuData(filters?: UseMenuDataProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await MenuAPI.getMenuItems(filters)
      if (response.success) {
        setMenuItems(response.data)
      } else {
        setError(response.message || "Failed to fetch menu items")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await MenuAPI.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [filters?.category, filters?.day, filters?.bestSeller])

  useEffect(() => {
    fetchCategories()
  }, [])

  const refetch = () => {
    fetchMenuItems()
  }

  return {
    menuItems,
    categories,
    loading,
    error,
    refetch,
  }
}

export function useBestSellers() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await MenuAPI.getBestSellers()
        if (response.success) {
          setBestSellers(response.data)
        } else {
          setError(response.message || "Failed to fetch best sellers")
        }
      } catch (err) {
        setError("Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchBestSellers()
  }, [])

  return { bestSellers, loading, error }
}
