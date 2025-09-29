# API Integration Guide

## Quick Start untuk Backend Developer

### 1. Setup Development Environment
\`\`\`bash
# Clone repository
git clone <repository-url>
cd bakesmart

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
\`\`\`

### 2. Current Mock Data Location
File `lib/api/mockData.ts` berisi data produk mock yang perlu diganti dengan API calls:

\`\`\`typescript
// Current mock implementation
export const products: Product[] = [
  // ... mock data
];

// Needs to be replaced with:
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`);
  return response.json();
}
\`\`\`

### 3. Priority Integration Tasks

#### High Priority
1. **Products API** - Replace mock data dengan real API
2. **Stock Management** - Implement real-time stock tracking
3. **Order Processing** - Handle order creation dan status updates

#### Medium Priority
1. **Payment Integration** - Connect dengan payment gateway
2. **User Authentication** - Add user accounts (optional)
3. **Admin Dashboard** - Manage products dan orders

#### Low Priority
1. **Analytics** - Order tracking dan reporting
2. **Notifications** - Email/SMS confirmations
3. **Inventory Alerts** - Low stock notifications

### 4. Testing Endpoints
Gunakan tools seperti Postman atau curl untuk test API endpoints:

\`\`\`bash
# Test products endpoint
curl -X GET http://localhost:8000/api/products

# Test stock check
curl -X POST http://localhost:8000/api/stock/check \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"1","quantity":2}]}'

# Test order creation
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[],"totalAmount":50000,"orderDate":"2024-01-15"}'
\`\`\`

### 5. Frontend Integration Points
File yang perlu dimodifikasi untuk integrasi backend:

1. `lib/api/mockData.ts` - Replace dengan API calls
2. `app/contexts/CartContext.tsx` - Add API integration
3. `components/orderPage/PaymentMethods.tsx` - Connect payment processing
4. `lib/api/stockManager.ts` - Replace localStorage dengan API

### 6. Error Handling Template
\`\`\`typescript
// Template untuk error handling di API calls
export async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}
