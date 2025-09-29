# BakeSmart Backend Documentation

## Project Overview
BakeSmart adalah aplikasi pemesanan roti online dengan sistem manajemen stock real-time dan cart yang terkunci berdasarkan hari. Aplikasi ini menggunakan Next.js dengan TypeScript dan memerlukan integrasi backend untuk production.

## Architecture Overview

### Frontend Structure
\`\`\`
app/
├── contexts/           # React Context untuk state management
│   ├── CartContext.tsx # Manajemen cart dan stock
│   └── TranslationContext.tsx
├── page.tsx           # Homepage
├── menu/              # Halaman menu produk
├── order/             # Halaman pemesanan
└── layout.tsx         # Root layout

components/
├── homePage/          # Komponen homepage
├── menuPage/          # Komponen menu
├── orderPage/         # Komponen order
└── ui/               # Reusable UI components

lib/
├── api/
│   ├── mockData.ts    # Data produk (perlu diganti dengan API)
│   └── stockManager.ts # Manajemen stock local
└── utils.ts
\`\`\`

## Data Models

### Product Model
\`\`\`typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  availableDays: string[]; // ["Senin", "Selasa", "Rabu", ...]
  stock: number;
  isPopular?: boolean;
}
\`\`\`

### Cart Item Model
\`\`\`typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  orderDay: string; // Hari pesanan
}
\`\`\`

### Order Model
\`\`\`typescript
interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string; // Format: YYYY-MM-DD
  orderDay: string;  // Hari dalam seminggu
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
}
\`\`\`

## API Endpoints yang Dibutuhkan

### Products API
\`\`\`
GET /api/products
- Mengambil semua produk dengan stock terkini
- Response: Product[]

GET /api/products/:id
- Mengambil detail produk berdasarkan ID
- Response: Product

GET /api/products/available/:day
- Mengambil produk yang tersedia di hari tertentu
- Params: day (Senin, Selasa, etc.)
- Response: Product[]
\`\`\`

### Stock Management API
\`\`\`
POST /api/stock/check
- Mengecek ketersediaan stock untuk multiple items
- Body: { items: { productId: string, quantity: number }[] }
- Response: { available: boolean, insufficientItems: string[] }

POST /api/stock/reserve
- Reserve stock untuk order (temporary hold)
- Body: { items: CartItem[], orderId: string }
- Response: { success: boolean, reservationId: string }

POST /api/stock/release
- Release reserved stock jika order dibatalkan
- Body: { reservationId: string }
- Response: { success: boolean }

POST /api/stock/commit
- Commit reserved stock (kurangi stock permanent)
- Body: { reservationId: string }
- Response: { success: boolean }
\`\`\`

### Orders API
\`\`\`
POST /api/orders
- Membuat order baru
- Body: Order (tanpa id, createdAt)
- Response: Order (dengan id dan createdAt)

GET /api/orders/:id
- Mengambil detail order
- Response: Order

PUT /api/orders/:id/status
- Update status order
- Body: { status: OrderStatus }
- Response: Order

GET /api/orders/date/:date
- Mengambil semua order untuk tanggal tertentu
- Response: Order[]
\`\`\`

## Business Logic yang Perlu Diimplementasi

### 1. Day-Based Product Availability
- Setiap produk memiliki `availableDays` array
- Produk hanya bisa dipesan di hari yang tersedia
- Cart terkunci ke satu hari setelah item pertama ditambahkan

### 2. Stock Management Rules
- Stock dikurangi saat order dikonfirmasi (bukan saat add to cart)
- Implementasi stock reservation untuk mencegah overselling
- Stock reservation expire setelah 15 menit jika tidak dikonfirmasi

### 3. Order Validation
- Validasi semua item tersedia di hari yang dipilih
- Validasi stock mencukupi sebelum konfirmasi order
- Validasi tanggal order tidak di masa lalu

## Database Schema

### Products Table
\`\`\`sql
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500),
  category VARCHAR(100),
  stock INT NOT NULL DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Product Availability Table
\`\`\`sql
CREATE TABLE product_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(255),
  day_of_week ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_product_day (product_id, day_of_week)
);
\`\`\`

### Orders Table
\`\`\`sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  total_amount DECIMAL(10,2) NOT NULL,
  order_date DATE NOT NULL,
  order_day VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  status ENUM('pending','confirmed','preparing','ready','completed') DEFAULT 'pending',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Order Items Table
\`\`\`sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
\`\`\`

### Stock Reservations Table
\`\`\`sql
CREATE TABLE stock_reservations (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  order_id VARCHAR(255),
  status ENUM('active','committed','released') DEFAULT 'active',
  FOREIGN KEY (product_id) REFERENCES products(id)
);
\`\`\`

## Integration Points

### 1. Replace Mock Data
File yang perlu diubah:
- `lib/api/mockData.ts` → Ganti dengan API calls
- `lib/api/stockManager.ts` → Integrasikan dengan backend stock API

### 2. Cart Context Integration
- `app/contexts/CartContext.tsx` perlu dimodifikasi untuk:
  - Call stock reservation API saat add to cart
  - Call stock commit API saat order selesai
  - Handle API errors dan loading states

### 3. Environment Variables
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
DATABASE_URL=mysql://user:password@localhost:3306/bakesmart
JWT_SECRET=your-jwt-secret
STOCK_RESERVATION_TIMEOUT=900 # 15 minutes in seconds
\`\`\`

## Error Handling

### Stock Errors
- `INSUFFICIENT_STOCK`: Stock tidak mencukupi
- `PRODUCT_UNAVAILABLE`: Produk tidak tersedia di hari tersebut
- `RESERVATION_EXPIRED`: Reservasi stock sudah expired

### Order Errors
- `INVALID_ORDER_DATE`: Tanggal order tidak valid
- `MIXED_DAY_ITEMS`: Item dari hari yang berbeda dalam satu order
- `PAYMENT_FAILED`: Pembayaran gagal

## Performance Considerations

### 1. Stock Caching
- Cache stock data di Redis untuk performa
- Update cache saat stock berubah
- Set TTL 5 menit untuk stock cache

### 2. Database Indexing
\`\`\`sql
-- Index untuk query yang sering digunakan
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_availability_day ON product_availability(day_of_week);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_stock_reservations_expires ON stock_reservations(expires_at);
\`\`\`

### 3. API Rate Limiting
- Implement rate limiting untuk stock check API
- Limit 100 requests per minute per IP

## Testing Strategy

### Unit Tests
- Product availability logic
- Stock calculation functions
- Order validation rules

### Integration Tests
- Stock reservation flow
- Order creation process
- Payment integration

### Load Tests
- Concurrent stock operations
- High-volume order processing
- Database performance under load

## Deployment Notes

### Production Checklist
- [ ] Setup database dengan proper indexing
- [ ] Configure Redis untuk caching
- [ ] Setup monitoring untuk stock levels
- [ ] Implement backup strategy
- [ ] Setup error logging dan alerting
- [ ] Configure auto-scaling untuk high traffic

### Monitoring
- Track stock levels dan alert jika rendah
- Monitor order completion rates
- Track API response times
- Alert untuk failed payments atau stock issues

## Security Considerations

### Data Protection
- Sanitize semua input dari frontend
- Validate order amounts dan quantities
- Implement CSRF protection
- Use HTTPS untuk semua API calls

### Stock Security
- Prevent negative stock values
- Audit trail untuk stock changes
- Rate limiting untuk prevent abuse
- Validate stock operations dengan database locks
