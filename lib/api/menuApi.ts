import {
  mockMenuItems,
  mockCategories,
  mockDays,
  type MenuItem,
  type ProductType,
  type ApiResponse,
} from "./mockData";

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
      // Try to fetch from localhost:5000/products first, fallback to mock data
      let items: MenuItem[] = [];

      try {
        const response = await fetch("http://localhost:5000/products");
        if (response.ok) {
          const apiData = await response.json();
          items = apiData.data || apiData; // Handle both {data: [...]} and [...] formats
          console.log("[v0] Successfully fetched from localhost:5000/products");
        } else {
          items = mockMenuItems;
          console.log("[v0] Using mock data - API response not ok");
        }
      } catch (fetchError) {
        console.log("[v0] Using mock data as localhost:5000 is not available");
        items = mockMenuItems;
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
            return hari.nama_id.toLowerCase() === filters.day?.toLowerCase();
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
      // Try to fetch from localhost:5000/products first, fallback to mock data
      let items: MenuItem[] = [];

      try {
        const response = await fetch("http://localhost:5000/products");
        if (response.ok) {
          const apiData = await response.json();
          items = apiData.data || apiData;
          console.log(
            "[v0] Successfully fetched bestsellers from localhost:5000/products"
          );
        } else {
          items = mockMenuItems;
        }
      } catch (fetchError) {
        items = mockMenuItems;
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
      // Try to fetch from localhost:5000/products first, fallback to mock data
      let items: MenuItem[] = [];

      try {
        const response = await fetch("http://localhost:5000/products");
        if (response.ok) {
          const apiData = await response.json();
          items = apiData.data || apiData;
        } else {
          items = mockMenuItems;
        }
      } catch (fetchError) {
        items = mockMenuItems;
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

  // Get all categories
  static async getCategories(): Promise<ApiResponse<ProductType[]>> {
    await delay(200);

    try {
      return {
        success: true,
        data: mockCategories,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch categories",
      };
    }
  }

  // Get available days
  static async getAvailableDays(): Promise<ApiResponse<typeof mockDays>> {
    await delay(200);

    try {
      return {
        success: true,
        data: mockDays,
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
      // Try to fetch from localhost:5000/products first, fallback to mock data
      let items: MenuItem[] = [];

      try {
        const response = await fetch("http://localhost:5000/products");
        if (response.ok) {
          const apiData = await response.json();
          items = apiData.data || apiData;
        } else {
          items = mockMenuItems;
        }
      } catch (fetchError) {
        items = mockMenuItems;
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
