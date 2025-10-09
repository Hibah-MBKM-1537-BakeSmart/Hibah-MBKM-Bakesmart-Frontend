'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Search,
  Calendar,
  User,
  Package,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useProduction } from '@/app/contexts/ProductionContext';
import { OrderDetailModal } from './OrderDetailModal';
import { EditOrderModal } from './EditOrderModal';
import { PrintModal } from './PrintModal';
import type { Order, ProductionStatus } from '@/app/contexts/ProductionContext';

export function ProductionTable() {
  const { orders, getOrdersByStatus, updateOrderStatus, deleteOrder } = useProduction();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const itemsPerPage = 10;

  // Get verified orders (completed and incompleted only)
  const completedOrders = getOrdersByStatus('completed');
  const incompletedOrders = getOrdersByStatus('incompleted');
  const allVerifiedOrders = [...completedOrders, ...incompletedOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Filter orders based on search term
  const filteredOrders = allVerifiedOrders.filter(order =>
    order.order_products?.[0]?.product?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (orderId: number, orderName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderId}?`)) {
      deleteOrder(orderId);
      alert(`Pesanan #${orderId} berhasil dihapus`);
    }
  };

  const handleUpdateOrder = (orderId: number, status: ProductionStatus, waktuAmbil?: string) => {
    updateOrderStatus(orderId, status);
    // In real app, also update waktu_ambil if provided
    console.log(`Updated order ${orderId} to ${status}`, waktuAmbil);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Selesai
        </span>
      );
    } else if (status === 'incompleted') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Belum Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e0d5c7' }}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#e0d5c7' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" style={{ color: '#059669' }} />
            <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
              Produksi yang Sudah Diverifikasi
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {filteredOrders.length} pesanan
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Print Button */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Printer className="w-4 h-4" />
              Cetak Daftar Produksi
            </button>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b6f47' }} />
              <input
                type="text"
                placeholder="Cari pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
                style={{ borderColor: '#e0d5c7' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: '#e0d5c7', backgroundColor: '#f9f7f4' }}>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#e0d5c7' }}>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Package className="w-12 h-12 mb-4" style={{ color: '#8b6f47' }} />
                    <p className="text-lg font-medium font-admin-heading" style={{ color: '#5d4037' }}>
                      Tidak ada pesanan yang sudah diverifikasi
                    </p>
                    <p className="text-sm font-admin-body mt-2" style={{ color: '#8b6f47' }}>
                      {searchTerm ? 'Coba sesuaikan kriteria pencarian.' : 'Pesanan yang sudah diverifikasi akan muncul di sini.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const totalAmount = order.order_products?.reduce((total, product) => 
                  total + (product.harga_beli || 0), 0) || 0;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden mr-3" style={{ backgroundColor: '#f9f7f4' }}>
                          {order.order_products?.[0]?.product?.gambars?.[0]?.file_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={order.order_products[0].product.gambars[0].file_path} 
                              alt={order.order_products[0].product?.nama || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5" style={{ color: '#8b6f47' }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                            {order.order_products?.[0]?.product?.nama || 'Product Name'}
                          </div>
                          {order.order_products && order.order_products.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{order.order_products.length - 1} produk lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" style={{ color: '#8b6f47' }} />
                        <div>
                          <div className="font-admin-body" style={{ color: '#5d4037' }}>
                            {order.user?.nama || 'Unknown Customer'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.user?.no_hp}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                        {order.order_products?.reduce((total, product) => total + (product.jumlah || 0), 0) || 0} pcs
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" style={{ color: '#8b6f47' }} />
                        <span className="font-admin-body" style={{ color: '#5d4037' }}>
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold font-admin-body" style={{ color: '#5d4037' }}>
                        {formatPrice(totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                          style={{ color: '#3b82f6' }}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 rounded-lg transition-colors hover:bg-orange-50"
                          style={{ color: '#f97316' }}
                          title="Edit Pesanan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.order_products?.[0]?.product?.nama || '')}
                          className="p-2 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: '#ef4444' }}
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t" style={{ borderColor: '#e0d5c7' }}>
          <div className="flex items-center justify-between">
            <div className="font-admin-body" style={{ color: '#8b6f47' }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border transition-colors font-admin-body disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: '#e0d5c7',
                  color: '#8b6f47'
                }}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-lg border transition-colors font-admin-body ${
                    currentPage === index + 1 ? 'font-semibold' : ''
                  }`}
                  style={{ 
                    borderColor: '#e0d5c7',
                    backgroundColor: currentPage === index + 1 ? '#8b6f47' : 'transparent',
                    color: currentPage === index + 1 ? 'white' : '#8b6f47'
                  }}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border transition-colors font-admin-body disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: '#e0d5c7',
                  color: '#8b6f47'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <EditOrderModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateOrder={handleUpdateOrder}
      />

      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        orders={orders}
      />
    </div>
  );
}