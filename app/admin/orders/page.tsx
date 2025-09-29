'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { FrontendOrder, OrderAttribute, FrontendOrderItem, CustomerInfo } from '../../../lib/types/admin';

const mockOrders: FrontendOrder[] = [
  {
    orderId: 'ORDER_1757923049385_y7wm4j233',
    timestamp: '2025-01-15T10:30:00.000Z',
    paymentMethod: 'transfer',
    paymentMethodLabel: 'Transfer Bank',
    totalItems: 2,
    subtotal: 125000,
    tax: 12500,
    deliveryFee: 5000,
    totalAmount: 142500,
    currency: 'IDR',
    status: 'delivered',
    paymentStatus: 'paid',
    deliveryDate: new Date('2025-01-15T14:00:00'),
    customer: {
      recipientName: 'John Doe',
      phoneNumber: '+62 812-3456-7890',
      deliveryMode: 'delivery',
      orderDay: 'senin',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      postalCode: '10220',
      notes: 'Tolong diantar sore hari',
      coordinates: {
        latitude: '-6.2088',
        longitude: '106.8456'
      }
    },
    items: [
      {
        productId: 1,
        productName: 'Foccacia Plain',
        category: 'foccacia',
        quantity: 1,
        basePrice: 20000,
        originalPrice: 25000,
        isDiscounted: true,
        selectedAttributes: [
          {
            id: 1,
            name: 'Extra Herbs',
            additionalPrice: 3000
          }
        ],
        attributesPrice: 3000,
        totalItemPrice: 23000,
        orderDay: 'senin',
        availableDays: ['senin', 'rabu', 'jumat'],
        cartId: 'cart_1757923019880_6u590jg4g',
        image: '/img/Roti.png'
      },
      {
        productId: 8,
        productName: 'Roti Kopi Mocha',
        category: 'roti-kopi',
        quantity: 1,
        basePrice: 20000,
        originalPrice: 26000,
        isDiscounted: false,
        selectedAttributes: [
          {
            id: 2,
            name: 'Tambah Coklat',
            additionalPrice: 5000
          }
        ],
        attributesPrice: 5000,
        totalItemPrice: 25000,
        orderDay: 'senin',
        availableDays: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
        cartId: 'cart_1757922308460_4gbzaglvp',
        image: '/blueberry-muffin-with-fresh-blueberries.jpg'
      }
    ]
  },
  {
    orderId: 'ORDER_1757923050000_abc123def',
    timestamp: '2025-01-15T11:45:00.000Z',
    paymentMethod: 'cash',
    paymentMethodLabel: 'Cash on Delivery',
    totalItems: 1,
    subtotal: 85000,
    tax: 8500,
    deliveryFee: 0,
    totalAmount: 93500,
    currency: 'IDR',
    status: 'processing',
    paymentStatus: 'pending',
    customer: {
      recipientName: 'Jane Smith',
      phoneNumber: '+62 813-4567-8901',
      deliveryMode: 'pickup',
      orderDay: 'rabu',
      notes: 'Please add extra frosting'
    },
    items: [
      {
        productId: 3,
        productName: 'Country Bread Klasik',
        category: 'country-bread',
        quantity: 12,
        basePrice: 18000,
        originalPrice: 23000,
        isDiscounted: true,
        selectedAttributes: [],
        attributesPrice: 0,
        totalItemPrice: 85000,
        orderDay: 'rabu',
        availableDays: ['senin', 'selasa', 'rabu', 'kamis', 'jumat'],
        cartId: 'cart_1757923027521_7udozcvjd',
        image: '/blueberry-muffin-with-fresh-blueberries.jpg'
      }
    ]
  },
  {
    orderId: 'ORDER_1757923051111_xyz789ghi',
    timestamp: '2025-01-15T09:15:00.000Z',
    paymentMethod: 'card',
    paymentMethodLabel: 'Credit Card',
    totalItems: 1,
    subtotal: 200000,
    tax: 20000,
    deliveryFee: 10000,
    totalAmount: 230000,
    currency: 'IDR',
    status: 'pending',
    paymentStatus: 'paid',
    customer: {
      recipientName: 'Mike Johnson',
      phoneNumber: '+62 814-5678-9012',
      deliveryMode: 'delivery',
      orderDay: 'jumat',
      address: 'Perum Pleret Asri, Sumber, Surakarta',
      postalCode: '57172',
      notes: 'Happy Birthday Sarah - Pink decorations',
      coordinates: {
        latitude: '-7.5431936',
        longitude: '110.8017152'
      }
    },
    items: [
      {
        productId: 6,
        productName: 'Gandum 4 Grain',
        category: 'gandum',
        quantity: 1,
        basePrice: 28000,
        originalPrice: null,
        isDiscounted: false,
        selectedAttributes: [],
        attributesPrice: 0,
        totalItemPrice: 28000,
        orderDay: 'jumat',
        availableDays: ['senin', 'rabu', 'jumat', 'minggu'],
        cartId: 'cart_1757922305078_o7jmomfl3',
        image: '/red-velvet-cake-slice-with-cream-cheese-frosting.jpg'
      }
    ]
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  processing: AlertCircle,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: AlertCircle
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<FrontendOrder[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');

  const statusOptions = ['all', 'pending', 'processing', 'ready', 'delivered', 'cancelled'];
  const paymentStatusOptions = ['all', 'pending', 'paid', 'refunded'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item: FrontendOrderItem) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: FrontendOrder['status']) => {
    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and delivery status</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            >
              {paymentStatusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Payments' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order: FrontendOrder) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                return (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      {order.customer.notes && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {order.customer.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.recipientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer.phoneNumber}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            {order.customer.deliveryMode === 'delivery' ? (
                              <>
                                <Truck className="w-3 h-3 mr-1" />
                                Delivery
                              </>
                            ) : (
                              <>
                                <Package className="w-3 h-3 mr-1" />
                                Pickup
                              </>
                            )}
                          </div>
                          {order.customer.address && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              📍 {order.customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.map((item: FrontendOrderItem, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                            <div className="flex items-center mb-1">
                              <Package className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="font-medium">{item.quantity}x {item.productName}</span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {item.category}
                              </span>
                            </div>
                            {item.selectedAttributes.length > 0 && (
                              <div className="ml-4 text-xs text-gray-600">
                                <div className="font-medium text-blue-600 mb-1">Customizations:</div>
                                {item.selectedAttributes.map((attr: OrderAttribute, attrIndex: number) => (
                                  <div key={attrIndex} className="flex justify-between">
                                    <span>• {attr.name}</span>
                                    <span>+{formatPrice(attr.additionalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="ml-4 text-xs text-gray-500 mt-1">
                              Base: {formatPrice(item.basePrice)} | Total: {formatPrice(item.totalItemPrice)}
                              {item.isDiscounted && item.originalPrice && (
                                <span className="ml-1 line-through text-red-500">
                                  ({formatPrice(item.originalPrice)})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Order day: <span className="font-medium ml-1">{order.customer.orderDay}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Subtotal: {formatPrice(order.subtotal)}</div>
                        {order.tax > 0 && <div>Tax: {formatPrice(order.tax)}</div>}
                        {order.deliveryFee > 0 && <div>Delivery: {formatPrice(order.deliveryFee)}</div>}
                        <div className="font-medium text-blue-600">{order.totalItems} items</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.paymentMethodLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(order.timestamp)}</div>
                      {order.deliveryDate && (
                        <div className="text-xs text-gray-500">
                          Delivered: {formatDate(order.deliveryDate.toISOString())}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-orange-600 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.orderId, 'processing')}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusOptions.slice(1).map(status => {
          const count = orders.filter(order => order.status === status).length;
          const StatusIcon = statusIcons[status as keyof typeof statusIcons];
          return (
            <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    {status}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
                <StatusIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
