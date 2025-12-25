'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface User {
  id: number;
  nama: string;
  no_hp: string;
}

interface OrderProduct {
  id: number;
  product: {
    id: number;
    nama: string;
    gambar: string;
  };
  jumlah: number;
  harga_beli: number;
  note?: string;
  addons?: Array<{
    addon_id: number;
    nama: string;
    harga: number;
    quantity: number;
  }>;
}

interface Order {
  id: number;
  user: User;
  order_products: OrderProduct[];
  status: 'verifying' | 'pending' | 'paid' | 'completed';
  created_at: string;
  scheduled_date: string;
  notes?: string;
  production_status?: 'pending' | 'in_production' | 'completed';
}

// Demo data
const DEMO_ORDERS = (): Order[] => [
  {
    id: 2001,
    user: { id: 201, nama: 'Ahmad Rizki', no_hp: '08111222333' },
    order_products: [
      {
        id: 601,
        product: { id: 1, nama: 'Roti Tawar', gambar: '/img/roti-tawar.jpg' },
        jumlah: 3,
        harga_beli: 15000,
        note: 'Dipanggang golden',
        addons: [{ addon_id: 1, nama: 'Topping Coklat', harga: 2000, quantity: 2 }]
      }
    ],
    status: 'verifying',
    created_at: '2025-12-25T08:00:00Z',
    scheduled_date: '2025-12-25',
    notes: 'Pesanan baru - menunggu verifikasi'
  },
  {
    id: 2002,
    user: { id: 202, nama: 'Siti Nur', no_hp: '08222333444' },
    order_products: [
      {
        id: 602,
        product: { id: 2, nama: 'Cupcakes', gambar: '/img/cupcakes.jpg' },
        jumlah: 12,
        harga_beli: 8000,
        note: 'Warna merah muda',
        addons: [{ addon_id: 4, nama: 'Frosting Strawberry', harga: 2000, quantity: 10 }]
      }
    ],
    status: 'pending',
    created_at: '2025-12-24T14:30:00Z',
    scheduled_date: '2025-12-25',
    notes: 'Menunggu bukti pembayaran'
  },
  {
    id: 2003,
    user: { id: 203, nama: 'Bima Sakti', no_hp: '08333444555' },
    order_products: [
      {
        id: 603,
        product: { id: 3, nama: 'Donuts', gambar: '/img/donuts.jpg' },
        jumlah: 20,
        harga_beli: 5000,
        addons: [{ addon_id: 3, nama: 'Sprinkles', harga: 1000, quantity: 20 }]
      }
    ],
    status: 'paid',
    created_at: '2025-12-24T10:00:00Z',
    scheduled_date: '2025-12-25',
    notes: '',
    production_status: 'pending'
  },
  {
    id: 2004,
    user: { id: 204, nama: 'Dewi Lestari', no_hp: '08444555666' },
    order_products: [
      {
        id: 604,
        product: { id: 4, nama: 'Croissant', gambar: '/img/croissant.jpg' },
        jumlah: 8,
        harga_beli: 10000,
        addons: []
      }
    ],
    status: 'completed',
    created_at: '2025-12-23T09:00:00Z',
    scheduled_date: '2025-12-23',
    notes: 'Sudah dikirim',
    production_status: 'completed'
  }
];

function OrderCard({
  order,
  onApprove,
  onReject,
  onVerifyPayment,
  onDone
}: {
  order: Order;
  onApprove?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onVerifyPayment?: (orderId: number) => void;
  onDone?: (orderId: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    verifying: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-800' },
    pending: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' },
    paid: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
    completed: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', badge: 'bg-green-100 text-green-800' }
  };

  const colors = statusColor[order.status];
  const totalItems = order.order_products.reduce((sum, p) => sum + p.jumlah, 0);
  const totalPrice = order.order_products.reduce((sum, p) => sum + p.jumlah * p.harga_beli, 0);

  return (
    <div className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 mb-3`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className={`font-bold text-lg ${colors.text}`}>
              #{order.id} - {order.user.nama}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            📞 {order.user.no_hp} | 📦 {totalItems} item | 💰 Rp{totalPrice.toLocaleString('id-ID')}
          </p>
        </div>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300">
          {/* Produk */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">📋 Produk Pesanan:</h4>
            <div className="space-y-3">
              {order.order_products.map(item => (
                <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-bold text-gray-900">
                    {item.product.nama} <span className="text-blue-600">x{item.jumlah}</span>
                  </p>
                  {item.note && <p className="text-sm text-gray-600 mt-1">📝 {item.note}</p>}
                  {item.addons && item.addons.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">Addon:</p>
                      <ul className="ml-4 list-disc">
                        {item.addons.map(addon => (
                          <li key={addon.addon_id}>
                            {addon.nama} x{addon.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-4 bg-purple-50 p-3 rounded border border-purple-300">
              <p className="text-sm font-semibold text-purple-900">📌 Catatan:</p>
              <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-4 text-xs text-gray-600">
            <p>Dibuat: {new Date(order.created_at).toLocaleString('id-ID')}</p>
            <p>Jadwal: {new Date(order.scheduled_date).toLocaleDateString('id-ID')}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {order.status === 'verifying' && (
              <>
                <button
                  onClick={() => onApprove?.(order.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Terima
                </button>
                <button
                  onClick={() => onReject?.(order.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  <X size={18} /> Tolak
                </button>
              </>
            )}
            {order.status === 'pending' && (
              <button
                onClick={() => onVerifyPayment?.(order.id)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                ✓ Verifikasi Pembayaran
              </button>
            )}
            {order.status === 'paid' && (
              <button
                onClick={() => onDone?.(order.id)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                ✓ Pesanan Selesai Dikirim
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try API first, fallback to demo
      try {
        const response = await fetch('/api/admin/orders?all=true', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || []);
        } else {
          setOrders(DEMO_ORDERS());
        }
      } catch {
        setOrders(DEMO_ORDERS());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan');
      setOrders(DEMO_ORDERS());
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'pending' as const } : o)));
      }
    } catch (err) {
      console.error('Error approving order:', err);
      // Local update as fallback
      setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'pending' as const } : o)));
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      // Local update as fallback
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const handleVerifyPayment = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'paid' as const } : o)));
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      // Local update as fallback
      setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'paid' as const } : o)));
    }
  };

  const handleDone = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'completed' as const } : o)));
      }
    } catch (err) {
      console.error('Error completing order:', err);
      // Local update as fallback
      setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'completed' as const } : o)));
    }
  };

  const groupedOrders = {
    verifying: orders.filter(o => o.status === 'verifying'),
    pending: orders.filter(o => o.status === 'pending'),
    paid: orders.filter(o => o.status === 'paid'),
    completed: orders.filter(o => o.status === 'completed')
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Manajemen Pesanan</h1>
      <p className="text-gray-600 mb-6">Kelola semua tahapan pesanan dari verifikasi hingga selesai dikirim</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded mb-6">{error}</div>}

      {/* VERIFYING */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-orange-800 mb-4">
          🔍 Verifikasi Pesanan ({groupedOrders.verifying.length})
        </h2>
        {groupedOrders.verifying.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada pesanan yang perlu diverifikasi</p>
        ) : (
          <div>
            {groupedOrders.verifying.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </section>

      {/* PENDING */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">
          ⏳ Menunggu Pembayaran ({groupedOrders.pending.length})
        </h2>
        {groupedOrders.pending.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada pesanan yang menunggu pembayaran</p>
        ) : (
          <div>
            {groupedOrders.pending.map(order => (
              <OrderCard key={order.id} order={order} onVerifyPayment={handleVerifyPayment} />
            ))}
          </div>
        )}
      </section>

      {/* PAID */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          💳 Sudah Dibayar (Siap Produksi) ({groupedOrders.paid.length})
        </h2>
        {groupedOrders.paid.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada pesanan yang sudah dibayar</p>
        ) : (
          <div>
            {groupedOrders.paid.map(order => (
              <OrderCard key={order.id} order={order} onDone={handleDone} />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          ✅ Pesanan Selesai ({groupedOrders.completed.length})
        </h2>
        {groupedOrders.completed.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada pesanan yang selesai</p>
        ) : (
          <div>
            {groupedOrders.completed.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
