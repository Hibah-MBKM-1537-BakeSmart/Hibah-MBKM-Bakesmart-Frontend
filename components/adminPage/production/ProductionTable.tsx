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
  Package
} from 'lucide-react';
import { useProduction } from '@/app/contexts/ProductionContext';
import type { Order } from '@/app/contexts/ProductionContext';

export function ProductionTable() {
  const { getOrdersByStatus } = useProduction();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get finished orders
  const finishedOrders = getOrdersByStatus('completed');
  
  // Filter orders based on search term
  const filteredOrders = finishedOrders.filter(order =>
    order.order_products?.[0]?.product?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleAction = (action: string, orderId: number) => {
    console.log(`${action} action for order ${orderId}`);
    // In real app, handle view, edit, delete actions
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e0d5c7' }}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#e0d5c7' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
            <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
              Finished Products
            </h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b6f47' }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ borderColor: '#e0d5c7' }}
            />
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
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-admin-body" style={{ color: '#8b6f47' }}>
                Status
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
                      No finished orders found
                    </p>
                    <p className="text-sm font-admin-body mt-2" style={{ color: '#8b6f47' }}>
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Finished orders will appear here.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                      {order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-3" style={{ backgroundColor: '#f9f7f4' }}>
                        {order.order_products?.[0]?.product?.gambars?.[0]?.file_path ? (
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" style={{ color: '#8b6f47' }} />
                      <span className="font-admin-body" style={{ color: '#5d4037' }}>
                        {order.user?.nama || 'Unknown Customer'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium font-admin-body" style={{ color: '#5d4037' }}>
                      {order.order_products?.[0]?.jumlah || 0} {(order.order_products?.[0]?.jumlah || 0) > 1 ? 'pcs' : 'pc'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-admin-body"
                      style={{ 
                        backgroundColor: '#d1fae5', 
                        color: '#059669' 
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" style={{ color: '#8b6f47' }} />
                      <span className="font-admin-body" style={{ color: '#5d4037' }}>
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold font-admin-body" style={{ color: '#5d4037' }}>
                      Rp {order.order_products?.reduce((sum, op) => sum + (op.harga_beli * op.jumlah), 0)?.toLocaleString('id-ID') || '0'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction('view', order.id)}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: '#8b6f47' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9f7f4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('edit', order.id)}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: '#8b6f47' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9f7f4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Edit Order"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('delete', order.id)}
                        className="p-1 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
    </div>
  );
}
