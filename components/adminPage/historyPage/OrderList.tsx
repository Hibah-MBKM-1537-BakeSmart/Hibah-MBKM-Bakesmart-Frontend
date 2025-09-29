'use client';

import React from 'react';
import { useHistory } from '@/app/contexts/HistoryContext';
import { OrderCard } from './OrderCard';
import { 
  Package, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export function OrderList() {
  const { state } = useHistory();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8b6f47' }} />
          <p className="text-lg font-admin-body" style={{ color: '#8b6f47' }}>
            Memuat pesanan...
          </p>
        </div>
      </div>
    );
  }

  if (state.filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center" style={{ borderColor: '#e0d5c7' }}>
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f9f7f4' }}>
          {state.filters.searchQuery || 
           state.filters.status !== '' || 
           state.filters.period !== 'all' ? (
            <AlertCircle className="w-8 h-8" style={{ color: '#8b6f47' }} />
          ) : (
            <Package className="w-8 h-8" style={{ color: '#8b6f47' }} />
          )}
        </div>
        
        {state.filters.searchQuery || 
         state.filters.status !== '' ||
         state.filters.period !== 'all' ? (
          <div>
            <h3 className="text-xl font-semibold mb-2 font-admin-heading" style={{ color: '#5d4037' }}>
              Tidak Ada Pesanan Ditemukan
            </h3>
            <p className="font-admin-body" style={{ color: '#8b6f47' }}>
              Tidak ada pesanan yang sesuai dengan filter yang dipilih.
              <br />
              Coba ubah atau reset filter untuk melihat lebih banyak pesanan.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-2 font-admin-heading" style={{ color: '#5d4037' }}>
              Belum Ada Pesanan
            </h3>
            <p className="font-admin-body" style={{ color: '#8b6f47' }}>
              Belum ada pesanan yang masuk ke sistem.
              <br />
              Pesanan akan muncul di sini setelah customer melakukan pemesanan.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: '#e0d5c7' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
              {state.filteredOrders.length}
            </p>
            <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              Total Pesanan
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
              {state.filteredOrders.filter(o => o.status === 'completed').length}
            </p>
            <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              Selesai
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
              {state.filteredOrders.filter(o => o.status === 'cancelled').length}
            </p>
            <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              Dibatalkan
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
              Rp {state.filteredOrders.reduce((sum, order) => {
                const orderTotal = order.order_products?.reduce((itemSum, item) => itemSum + item.harga_beli, 0) || 0;
                return sum + orderTotal;
              }, 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-admin-body" style={{ color: '#8b6f47' }}>
              Total Nilai
            </p>
          </div>
        </div>
      </div>

      {/* Order Cards */}
      <div className="grid gap-4">
        {state.filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Load More Button (for pagination in real implementation) */}
      {state.filteredOrders.length > 0 && state.filteredOrders.length % 10 === 0 && (
        <div className="text-center pt-6">
          <button 
            className="px-6 py-3 rounded-lg border transition-colors font-admin-body"
            style={{ 
              borderColor: '#e0d5c7',
              color: '#8b6f47'
            }}
          >
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
}
