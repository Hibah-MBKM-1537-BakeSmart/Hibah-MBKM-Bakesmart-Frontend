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
      // Use /api/orders/group to get all orders grouped by date
      const response = await fetch('/api/orders/group', {
        method: 'GET',
        cache: 'no-store'
      });
      if (response.ok) {
        const result = await response.json();
        // Transform order groups to flat order list
        const allOrders: Order[] = [];
        if (Array.isArray(result.data)) {
          result.data.forEach((group: any) => {
            group.orders?.forEach((order: any) => {
              allOrders.push({
                id: order.id,
                user: {
                  id: order.user?.id || order.user_id,
                  nama: order.user?.nama || 'Unknown',
                  no_hp: order.user?.no_hp || '-'
                },
                order_products: (order.products || []).map((p: any) => ({
                  id: p.product_id,
                  product: {
                    id: p.product_id,
                    nama: p.product_name_id,
                    gambar: ''
                  },
                  jumlah: p.jumlah,
                  harga_beli: p.harga_beli,
                  note: p.note || '',
                  addons: []
                })),
                status: order.status === 'ongoing' ? 'pending' : order.status,
                created_at: order.created_at || group.tanggal,
                scheduled_date: group.tanggal,
                notes: order.note || '',
                production_status: order.production_status
              });
            });
          });
        }
        setOrders(allOrders);
      } else {
        throw new Error('Gagal memuat pesanan dari server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: number) => {
    try {
      // Confirm order (changes status from draft to ongoing)
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'pending' as const } : o)));
      } else {
        console.error('Failed to approve order');
      }
    } catch (err) {
      console.error('Error approving order:', err);
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      // Delete order
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
      } else {
        console.error('Failed to reject order');
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
    }
  };

  const handleVerifyPayment = async (orderId: number) => {
    try {
      // Update order status to paid (ongoing)
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ongoing' })
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'paid' as const } : o)));
      } else {
        console.error('Failed to verify payment');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  const handleDone = async (orderId: number) => {
    try {
      // Finish order (sets status to completed and sends WhatsApp notification)
      const response = await fetch(`/api/orders/${orderId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'completed' as const } : o)));
      } else {
        console.error('Failed to complete order');
      }
    } catch (err) {
      console.error('Error completing order:', err);
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
