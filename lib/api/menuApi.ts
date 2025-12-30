import type {
  MenuItem,
  ProductType,
} from "@/lib/types";

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Available days for ordering
const availableDays = [
  { id: "Senin", name_id: "Senin", name_en: "Monday" },
  { id: "Selasa", name_id: "Selasa", name_en: "Tuesday" },
  { id: "Rabu", name_id: "Rabu", name_en: "Wednesday" },
  { id: "Kamis", name_id: "Kamis", name_en: "Thursday" },
  { id: "Jumat", name_id: "Jumat", name_en: "Friday" },
  { id: "Sabtu", name_id: "Sabtu", name_en: "Saturday" },
  { id: "Minggu", name_id: "Minggu", name_en: "Sunday" },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function transformApiDataToComponentFormat(
  apiItem: MenuItem,
  language: "id" | "en" = "id"
): MenuItem {
  // Return the original item without transformation
  return apiItem;
}

export class MenuAPI {
  static async getMenuItems(filters?: {
    category?: string;
    day?: string;
    bestSeller?: boolean;
  }): Promise<ApiResponse<MenuItem[]>> {
    await delay(500); // Simulate network delay

    try {
      let items: MenuItem[] = [];

      const response = await fetch("http://localhost:5000/products");
      if (response.ok) {
        const apiData = await response.json();
        items = apiData.data || apiData; // Handle both {data: [...]} and [...] formats
        console.log("[v0] Successfully fetched from localhost:5000/products");
      } else {
        console.log("[v0] API response not ok");
        return {
          success: false,
          data: [],
          message: "Failed to fetch menu items",
        };
      }

      let filteredItems = [...items];

      if (filters?.category && filters.category !== "all") {
        filteredItems = filteredItems.filter((item) =>
          item.jenis.some(
            (jenis) =>
              jenis.nama_id.toLowerCase().replace(/ /g, "-") ===
              filters.category
          )
        );
      }

      if (filters?.day && filters.day !== "all") {
        filteredItems = filteredItems.filter((item) => {
          return item.hari.some((hari) => {
            // Exact case-sensitive match since MenuGrid uses proper capitalization
            return hari.nama_id === filters.day;
          });
        });
      }

      if (filters?.bestSeller) {
        filteredItems = filteredItems.filter((item) => item.isBestSeller);
      }

      const transformedItems = filteredItems.map((item) =>
        transformApiDataToComponentFormat(item, "id")
      );

      return {
        success: true,
        data: transformedItems,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch menu items",
      };
    }
  }

  static async getBestSellers(): Promise<ApiResponse<MenuItem[]>> {
    await delay(300);

    try {
      let items: MenuItem[] = [];

      const response = await fetch("http://localhost:5000/products");
      if (response.ok) {
        const apiData = await response.json();
        items = apiData.data || apiData;
        console.log(
          "[v0] Successfully fetched bestsellers from localhost:5000/products"
        );
      } else {
        return {
          success: false,
          data: [],
          message: "Failed to fetch best sellers",
        };
      }

      const bestSellers = items.filter((item) => item.isBestSeller);

      const transformedBestSellers = bestSellers.map((item) =>
        transformApiDataToComponentFormat(item, "id")
      );

      return {
        success: true,
        data: transformedBestSellers,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch best sellers",
      };
    }
  }

  static async getMenuItem(id: number): Promise<ApiResponse<any | null>> {
    await delay(200);

    try {
      let items: MenuItem[] = [];

      const response = await fetch("http://localhost:5000/products");
      if (response.ok) {
        const apiData = await response.json();
        items = apiData.data || apiData;
      } else {
        return {
          success: false,
          data: null,
          message: "Failed to fetch menu item",
        };
      }

      const item = items.find((item) => item.id === id);

      const transformedItem = item
        ? transformApiDataToComponentFormat(item, "id")
        : null;

      return {
        success: true,
        data: transformedItem,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Failed to fetch menu item",
      };
    }
  }

  // Get all categories from API
  static async getCategories(): Promise<ApiResponse<ProductType[]>> {
    await delay(200);

    try {
      const response = await fetch("http://localhost:5000/categories");
      if (response.ok) {
        const apiData = await response.json();
        const categories = apiData.data || apiData;
        return {
          success: true,
          data: categories,
        };
      }
      return {
        success: false,
        data: [],
        message: "Failed to fetch categories",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch categories",
      };
    }
  }

  // Get available days (static data)
  static async getAvailableDays(): Promise<ApiResponse<typeof availableDays>> {
    await delay(200);

    try {
      return {
        success: true,
        data: availableDays,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch available days",
      };
    }
  }

  static async searchMenuItems(
    query: string
  ): Promise<ApiResponse<MenuItem[]>> {
    await delay(400);

    try {
      let items: MenuItem[] = [];

      const response = await fetch("http://localhost:5000/products");
      if (response.ok) {
        const apiData = await response.json();
        items = apiData.data || apiData;
      } else {
        return {
          success: false,
          data: [],
          message: "Failed to search menu items",
        };
      }

      const searchResults = items.filter(
        (item) =>
          item.nama_id.toLowerCase().includes(query.toLowerCase()) ||
          item.nama_en.toLowerCase().includes(query.toLowerCase()) ||
          item.deskripsi_id.toLowerCase().includes(query.toLowerCase()) ||
          item.deskripsi_en.toLowerCase().includes(query.toLowerCase()) ||
          item.bahans.some(
            (bahan) =>
              bahan.nama_id.toLowerCase().includes(query.toLowerCase()) ||
              bahan.nama_en.toLowerCase().includes(query.toLowerCase())
          )
      );

      const transformedResults = searchResults.map((item) =>
        transformApiDataToComponentFormat(item, "id")
      );

      return {
        success: true,
        data: transformedResults,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to search menu items",
      };
    }
  }
}
