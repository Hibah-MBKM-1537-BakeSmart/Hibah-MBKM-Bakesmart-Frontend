"use client"

import { useState, useEffect } from "react"
import type { MenuItem, Category } from "@/lib/api/mockData"

interface UseMenuApiProps {
  category?: string
  day?: string
  bestSeller?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export function useMenuApi(filters?: UseMenuApiProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append("category", filters.category)
      if (filters?.day) params.append("day", filters.day)
      if (filters?.bestSeller) params.append("bestSeller", "true")

      const response = await fetch(`/api/menu?${params.toString()}`)
      const result: ApiResponse<MenuItem[]> = await response.json()

      if (result.success) {
        setMenuItems(result.data)
      } else {
        setError(result.message || "Failed to fetch menu items")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/menu/categories")
      const result: ApiResponse<Category[]> = await response.json()

      if (result.success) {
        setCategories(result.data)
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

export function useBestSellersApi() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/menu/bestsellers")
        const result: ApiResponse<MenuItem[]> = await response.json()

        if (result.success) {
          setBestSellers(result.data)
        } else {
          setError(result.message || "Failed to fetch best sellers")
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

export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  try {
    const response = await fetch(`/api/menu/search?q=${encodeURIComponent(query)}`)
    const result: ApiResponse<MenuItem[]> = await response.json()

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.message || "Search failed")
    }
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
