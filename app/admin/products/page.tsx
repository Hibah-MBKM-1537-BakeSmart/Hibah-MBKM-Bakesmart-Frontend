'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { AddProductModal } from '../../../components/adminPage/productsPage/AddProductModal';
import { CategoryManager } from '../../../components/adminPage/productsPage/CategoryManager';
import { useToast } from '../../../components/adminPage/Toast';
import { useCategories } from '../../contexts/CategoriesContext';

// Based on products table structure from backend
interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  created_at: string;
  updated_at: string;
  // Related data via joins
  gambars?: Array<{
    id: number;
    file_path: string;
    product_id: number;
  }>;
  jenis?: Array<{
    id: number;
    nama: string;
  }>;
  // Calculated fields
  sales?: number;
  rating?: number;
  status: 'active' | 'inactive';
}

const mockProducts: Product[] = [
  {
    id: 1,
    nama: 'Chocolate Cake',
    deskripsi: 'Rich chocolate cake with cream frosting',
    harga: 125000,
    stok: 15,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.8,
    sales: 145,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 1, file_path: '/img/chocolate-cake.jpg', product_id: 1 }]
  },
  {
    id: 2,
    nama: 'Red Velvet Cupcakes',
    deskripsi: 'Classic red velvet cupcakes (per piece)',
    harga: 15000,
    stok: 24,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.6,
    sales: 89,
    jenis: [{ id: 2, nama: 'Cupcake' }],
    gambars: [{ id: 2, file_path: '/img/red-velvet-cupcakes.jpg', product_id: 2 }]
  },
  {
    id: 4,
    nama: 'Birthday Cake',
    deskripsi: 'Custom birthday cake with decoration',
    harga: 200000,
    stok: 8,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.9,
    sales: 67,
    jenis: [{ id: 1, nama: 'Cake' }],
    gambars: [{ id: 4, file_path: '/img/birthday-cake.jpg', product_id: 4 }]
  },
  {
    id: 5,
    nama: 'Donuts Box (12 pcs)',
    deskripsi: 'Mixed flavors donut box',
    harga: 60000,
    stok: 50,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.4,
    sales: 234,
    jenis: [{ id: 4, nama: 'Donut' }],
    gambars: [{ id: 5, file_path: '/img/donuts.jpg', product_id: 5 }]
  },
  {
    id: 3,
    nama: 'Croissant',
    deskripsi: 'Buttery French croissant',
    harga: 12000,
    stok: 0,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'inactive',
    rating: 4.2,
    sales: 156,
    jenis: [{ id: 3, nama: 'Pastry' }],
    gambars: [{ id: 3, file_path: '/img/croissant.jpg', product_id: 3 }]
  },
  {
    id: 6,
    nama: 'Cheese Tart',
    deskripsi: 'Creamy cheese tart',
    harga: 25000,
    stok: 12,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.5,
    sales: 78,
    jenis: [{ id: 5, nama: 'Tart' }],
    gambars: [{ id: 6, file_path: '/img/cheese-tart.jpg', product_id: 6 }]
  },
  {
    id: 7,
    nama: 'Apple Pie',
    deskripsi: 'Traditional apple pie',
    harga: 45000,
    stok: 6,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.7,
    sales: 45,
    jenis: [{ id: 6, nama: 'Pie' }],
    gambars: [{ id: 7, file_path: '/img/apple-pie.jpg', product_id: 7 }]
  },
  {
    id: 8,
    nama: 'Bagel',
    deskripsi: 'Fresh baked bagel',
    harga: 18000,
    stok: 20,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    status: 'active',
    rating: 4.3,
    sales: 92,
    jenis: [{ id: 7, nama: 'Bread' }],
    gambars: [{ id: 8, file_path: '/img/bagel.jpg', product_id: 8 }]
  }
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const { addToast, ToastContainer } = useToast();
  const { categories } = useCategories();

  // Combine 'all' with actual category names
  const categoryOptions = ['all', ...categories.map(cat => cat.nama)];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const productCategory = product.jenis?.[0]?.nama || '';
    const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sales' | 'rating'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Date.now(), // Generate temporary ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sales: 0,
      rating: 0
    };
    
    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
    
    // Show success notification
    addToast({
      type: 'success',
      title: 'Produk berhasil ditambahkan!',
      message: `${newProduct.nama} telah ditambahkan ke katalog produk.`,
    });
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast({
        type: 'success',
        title: 'Produk berhasil dihapus!',
        message: `${productName} telah dihapus dari katalog produk.`,
      });
    }
  };

  const handleEditProduct = (productId: number, productName: string) => {
    // Placeholder untuk fungsi edit
    addToast({
      type: 'info',
      title: 'Fitur Edit',
      message: `Edit produk "${productName}" akan segera tersedia.`,
    });
  };

  const handleViewProduct = (productId: number, productName: string) => {
    // Placeholder untuk fungsi view detail
    addToast({
      type: 'info',
      title: 'Detail Produk',
      message: `Detail produk "${productName}" akan segera tersedia.`,
    });
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your bakery products and inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Kelola Kategori</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.nama}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.deskripsi}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.jenis?.[0]?.nama || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(product.harga)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stok === 0 
                        ? 'bg-red-100 text-red-800'
                        : product.stok < 10 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stok} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-900">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewProduct(product.id, product.nama)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product.id, product.nama)}
                        className="text-gray-400 hover:text-orange-600 p-1"
                        title="Edit Produk"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.nama)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.stok < 10).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.stok === 0).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </div>
  );
}
