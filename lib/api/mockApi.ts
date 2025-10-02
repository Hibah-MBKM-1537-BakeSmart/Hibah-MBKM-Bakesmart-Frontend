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

// Product API functions
export const productsApi = {
  // Get all products
  getAll: () => apiRequest<any[]>('/products'),
  
  // Get product by ID
  getById: (id: number) => apiRequest<any>(`/products/${id}`),
  
  // Create new product
  create: (product: any) => apiRequest<any>('/products', {
    method: 'POST',
    body: JSON.stringify({
      ...product,
      id: Date.now(), // Generate ID for new product
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sales: 0,
      rating: 0,
    }),
  }),
  
  // Update product
  update: (id: number, product: Partial<any>) => apiRequest<any>(`/products/${id}`, {
    method: 'PUT',
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

// Categories API functions
export const categoriesApi = {
  // Get all categories
  getAll: () => apiRequest<any[]>('/categories'),
  
  // Get category by ID
  getById: (id: number) => apiRequest<any>(`/categories/${id}`),
  
  // Create new category
  create: (category: any) => apiRequest<any>('/categories', {
    method: 'POST',
    body: JSON.stringify({
      ...category,
      id: Date.now(), // Generate ID for new category
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  }),
  
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