// API configuration
const API_BASE_URL = 'http://localhost:3001';

// Generic API utility functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed:`, error);
    throw error;
  }
}

// Helper function to generate safe auto-increment ID
async function getNextProductId(): Promise<number> {
  try {
    const products = await apiRequest<any[]>('/products');
    if (products.length === 0) return 1;
    
    // Find the highest ID and add 1
    const maxId = Math.max(...products.map(p => {
      const id = typeof p.id === 'string' ? parseInt(p.id) : p.id;
      return isNaN(id) ? 0 : id;
    }));
    
    return maxId + 1;
  } catch (error) {
    console.warn('Failed to get next ID, using fallback');
    return Date.now(); // Fallback to timestamp if API fails
  }
}

// Product API functions
export const productsApi = {
  // Get all products
  getAll: () => apiRequest<any[]>('/products'),
  
  // Get product by ID
  getById: (id: number) => apiRequest<any>(`/products/${id}`),
  
  // Create new product
  create: async (product: any) => {
    const nextId = await getNextProductId();
    return apiRequest<any>('/products', {
      method: 'POST',
      body: JSON.stringify({
        ...product,
        id: nextId, // Use auto-increment ID instead of timestamp
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sales: 0,
        rating: 0,
      }),
    });
  },
  
  // Update product
  update: (id: number, product: Partial<any>) => apiRequest<any>(`/products/${id}`, {
    method: 'PATCH', // Changed from PUT to PATCH for partial updates
    body: JSON.stringify({
      ...product,
      updated_at: new Date().toISOString(),
    }),
  }),
  
  // Delete product
  delete: (id: number) => apiRequest<any>(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Helper function to generate safe auto-increment ID for categories
async function getNextCategoryId(): Promise<string> {
  try {
    const categories = await apiRequest<any[]>('/categories');
    if (categories.length === 0) return "1";
    
    // Find the highest numeric ID and add 1
    const maxId = Math.max(...categories.map(c => {
      const id = typeof c.id === 'string' ? parseInt(c.id) : c.id;
      return isNaN(id) ? 0 : id;
    }));
    
    return String(maxId + 1);
  } catch (error) {
    console.warn('Failed to get next category ID, using fallback');
    return String(Date.now()); // Fallback to timestamp if API fails
  }
}

// Categories API functions
export const categoriesApi = {
  // Get all categories
  getAll: () => apiRequest<any[]>('/categories'),
  
  // Get category by ID
  getById: (id: number) => apiRequest<any>(`/categories/${id}`),
  
  // Create new category
  create: async (category: any) => {
    const nextId = await getNextCategoryId();
    return apiRequest<any>('/categories', {
      method: 'POST',
      body: JSON.stringify({
        ...category,
        id: nextId, // Use auto-increment ID (as string for categories)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  },
  
  // Update category
  update: (id: number, category: Partial<any>) => apiRequest<any>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...category,
      updated_at: new Date().toISOString(),
    }),
  }),
  
  // Delete category
  delete: (id: number) => apiRequest<any>(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Connection check utility
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products?_limit=1`);
    return response.ok;
  } catch (error) {
    return false;
  }
};