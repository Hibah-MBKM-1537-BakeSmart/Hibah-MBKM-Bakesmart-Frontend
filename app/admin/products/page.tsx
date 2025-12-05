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
  MoreHorizontal,
  Settings,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { AddProductModal } from '@/components/adminPage/productsPage/AddProductModal';
import { CategoryManager } from '@/components/adminPage/productsPage/CategoryManager';
import { ProductDetailModal } from '@/components/adminPage/productsPage/ProductDetailModal';
import { EditProductModal } from '@/components/adminPage/productsPage/EditProductModal';
import { useToast } from '@/components/adminPage/Toast';
import { useCategories } from '@/app/contexts/CategoriesContext';
import { useProducts, Product } from '@/app/contexts/ProductsContext';

// Mock products moved to ProductsContext

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [sortField, setSortField] = useState<'nama' | 'category' | 'day' | 'harga' | 'stok' | 'sales'>('nama');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [stockRange, setStockRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<string>(''); // Changed to string to preserve user input
  const [pendingStockChanges, setPendingStockChanges] = useState<Record<number, number>>({}); // Track pending changes
  const { addToast, ToastContainer } = useToast();
  const { categories } = useCategories();
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();

  // Extract unique jenis from backend products
  const uniqueJenis = React.useMemo(() => {
    const jenisSet = new Set<string>();
    products.forEach(product => {
      product.jenis?.forEach(j => {
        // Use nama_en for consistency (English names shown in table)
        const jenisNama = j.nama_en || j.nama_id || j.nama;
        if (jenisNama) jenisSet.add(jenisNama);
      });
    });
    return Array.from(jenisSet).sort();
  }, [products]);

  // Extract unique days from backend products
  const uniqueDays = React.useMemo(() => {
    // Define day order (Monday to Sunday)
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysSet = new Set<string>();
    
    products.forEach(product => {
      product.hari?.forEach(h => {
        // Use nama_en for consistency (English names shown in table)
        const dayNama = h.nama_en || h.nama_id || h.nama;
        if (dayNama) daysSet.add(dayNama);
      });
    });
    
    // Sort days according to week order instead of alphabetically
    return Array.from(daysSet).sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      // If day not found in dayOrder, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [products]);

  // Combine 'all' with actual jenis from backend
  const categoryOptions = ['all', ...uniqueJenis];
  const dayOptions = ['all', ...uniqueDays];

  // Sort and filter products
  const filteredProducts = products
    .filter(product => {
      // Add safety checks for undefined values
      if (!product || !product.nama) return false;
      
      // Search filter
      const matchesSearch = product.nama.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter - check all jenis for match using nama_en field
      const matchesCategory = selectedCategory === 'all' || 
        product.jenis?.some(j => {
          const jenisNama = j.nama_en || j.nama_id || j.nama;
          return jenisNama === selectedCategory;
        }) || false;
      
      // Day filter - check all hari for match using nama_en field
      const matchesDay = selectedDay === 'all' || 
        product.hari?.some(h => {
          const dayNama = h.nama_en || h.nama_id || h.nama;
          return dayNama === selectedDay;
        }) || false;
      
      // Price range filter
      const matchesPrice = product.harga >= priceRange.min && product.harga <= priceRange.max;
      
      // Stock range filter
      const matchesStock = (product.stok ?? 0) >= stockRange.min && (product.stok ?? 0) <= stockRange.max;
      
      return matchesSearch && matchesCategory && matchesDay && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'nama':
          comparison = a.nama.localeCompare(b.nama);
          break;
        case 'category':
          const categoryA = a.jenis?.[0]?.nama_en || a.jenis?.[0]?.nama_id || '';
          const categoryB = b.jenis?.[0]?.nama_en || b.jenis?.[0]?.nama_id || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
        case 'day':
          const dayA = a.hari?.[0]?.nama_en || a.hari?.[0]?.nama_id || '';
          const dayB = b.hari?.[0]?.nama_en || b.hari?.[0]?.nama_id || '';
          // Use day order for proper week sorting
          const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const indexA = dayOrder.indexOf(dayA);
          const indexB = dayOrder.indexOf(dayB);
          if (indexA !== -1 && indexB !== -1) {
            comparison = indexA - indexB;
          } else {
            comparison = dayA.localeCompare(dayB);
          }
          break;
        case 'harga':
          comparison = a.harga - b.harga;
          break;
        case 'stok':
          comparison = (a.stok ?? 0) - (b.stok ?? 0);
          break;
        case 'sales':
          comparison = (a.sales ?? 0) - (b.sales ?? 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Toggle sort
  const handleSort = (field: 'nama' | 'category' | 'day' | 'harga' | 'stok' | 'sales') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'nama' | 'category' | 'day' | 'harga' | 'stok' | 'sales') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddProduct = async (newProductData: Partial<Product>) => {
    try {
      await addProduct(newProductData);
      setShowAddModal(false);
      
      addToast({
        type: 'success',
        title: 'Product added successfully!',
        message: `${newProductData.nama} has been added to product catalog.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to add product',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (window.confirm(`Are you sure you want to delete product "${productName}"?`)) {
      try {
        await deleteProduct(productId);
        addToast({
          type: 'success',
          title: 'Product deleted successfully!',
          message: `${productName} has been removed from product catalog.`,
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Failed to delete product',
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    }
  };

  const handleEditProduct = (productId: number, productName: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowEditModal(true);
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!selectedProduct) return;
    
    try {
      await updateProduct(selectedProduct.id, productData);
      setShowEditModal(false);
      setSelectedProduct(null);
      
      addToast({
        type: 'success',
        title: 'Product updated successfully!',
        message: `${productData.nama || selectedProduct.nama} has been updated.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to update product',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleViewProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductDetail(true);
    }
  };

  const handleStockIncrement = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && typeof product.stok === 'number') {
      const currentPending = pendingStockChanges[productId] ?? product.stok;
      const newStok = currentPending + 1;
      console.log('Incrementing stock for product:', productId, 'from', currentPending, 'to', newStok);
      setPendingStockChanges(prev => ({
        ...prev,
        [productId]: newStok
      }));
    }
  };

  const handleStockDecrement = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && typeof product.stok === 'number') {
      const currentPending = pendingStockChanges[productId] ?? product.stok;
      if (currentPending > 0) {
        const newStok = currentPending - 1;
        console.log('Decrementing stock for product:', productId, 'from', currentPending, 'to', newStok);
        setPendingStockChanges(prev => ({
          ...prev,
          [productId]: newStok
        }));
      }
    }
  };

  const confirmStockChange = async (productId: number) => {
    const newStok = pendingStockChanges[productId];
    if (newStok === undefined) return;

    try {
      console.log('Confirming stock change for product:', productId, 'New stock:', newStok);
      await updateProduct(productId, { stok: newStok });
      
      // Remove from pending changes
      setPendingStockChanges(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      addToast({
        type: 'success',
        title: 'Stock updated!',
        message: `Stock has been updated to ${newStok}.`,
      });
    } catch (error) {
      console.error('Error confirming stock change:', error);
      addToast({
        type: 'error',
        title: 'Failed to update stock',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const cancelStockChange = (productId: number) => {
    setPendingStockChanges(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const startEditingStock = (productId: number, currentStock: number) => {
    setEditingStockId(productId);
    setTempStock(currentStock.toString()); // Convert to string
  };

  const handleStockInputChange = (value: string) => {
    // Allow only numbers, remove leading zeros except for "0"
    const cleanedValue = value.replace(/[^0-9]/g, '');
    setTempStock(cleanedValue);
  };

  const saveStockEdit = async (productId: number) => {
    try {
      const stockValue = parseInt(tempStock) || 0;
      console.log('Saving stock edit for product:', productId, 'New stock:', stockValue);
      await updateProduct(productId, { stok: stockValue });
      setEditingStockId(null);
      setTempStock('');
      addToast({
        type: 'success',
        title: 'Stock updated successfully!',
        message: `Stock has been updated to ${stockValue}.`,
      });
    } catch (error) {
      console.error('Error in saveStockEdit:', error);
      // Don't reset editingStockId so user can try again
      addToast({
        type: 'error',
        title: 'Failed to update stock',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setTempStock('');
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 text-sm lg:text-base">Manage your bakery products and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm lg:text-base">Manage Categories</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm lg:text-base">Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="space-y-4">
          {/* Search and Category Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Days Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm w-full sm:w-auto"
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>
                      {day === 'all' ? 'All Days' : day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center lg:text-right">
              {filteredProducts.length} of {products.length} products
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000000 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Stock Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stock Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={stockRange.min || ''}
                  onChange={(e) => setStockRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={stockRange.max || ''}
                  onChange={(e) => setStockRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDay('all');
                setPriceRange({ min: 0, max: 1000000 });
                setStockRange({ min: 0, max: 1000 });
                setSortField('nama');
                setSortDirection('asc');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter(p => p.stok < 10).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter(p => p.stok === 0).length}
              </p>
            </div>
            <div className="bg-red-100 p-2 lg:p-3 rounded-lg">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200 w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[280px]">
                  <button
                    onClick={() => handleSort('nama')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Product</span>
                    {getSortIcon('nama')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[140px]">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Category</span>
                    {getSortIcon('category')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[180px]">
                  <button
                    onClick={() => handleSort('day')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Available Days</span>
                    {getSortIcon('day')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[130px]">
                  <button
                    onClick={() => handleSort('harga')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Price</span>
                    {getSortIcon('harga')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[180px]">
                  <button
                    onClick={() => handleSort('stok')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Order Limit</span>
                    {getSortIcon('stok')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left whitespace-nowrap w-[100px]">
                  <button
                    onClick={() => handleSort('sales')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Sales</span>
                    {getSortIcon('sales')}
                  </button>
                </th>
                <th className="px-3 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 w-[280px]">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg mr-3 lg:mr-4 flex-shrink-0 relative">
                        {product.gambars && product.gambars.length > 0 ? (
                          <>
                            <img
                              src={product.gambars[0].file_path}
                              alt={product.nama}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                // Fallback to default icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                            <div 
                              className="fallback-icon absolute inset-0 w-10 h-10 bg-orange-100 rounded-lg items-center justify-center"
                              style={{ display: 'none' }}
                            >
                              <Package className="w-5 h-5 text-orange-600" />
                            </div>
                          </>
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.nama}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500 truncate max-w-[150px] lg:max-w-xs">
                          {product.deskripsi}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap w-[140px]">
                    <span className="inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.jenis?.[0]?.nama_en || product.jenis?.[0]?.nama_id || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 w-[180px]">
                    <div className="flex flex-wrap gap-1">
                      {product.hari && product.hari.length > 0 ? (
                        product.hari.map((day) => (
                          <span
                            key={day.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {day.nama_id || day.nama}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No days set</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900 w-[130px]">
                    {product.harga ? formatPrice(product.harga) : 'Rp 0'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-[180px]">
                    {editingStockId === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={tempStock}
                          onChange={(e) => handleStockInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveStockEdit(product.id);
                            } else if (e.key === 'Escape') {
                              cancelStockEdit();
                            }
                          }}
                          className="w-20 px-3 py-2 border-2 border-orange-500 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                          autoFocus
                          placeholder="0"
                        />
                        <button
                          onClick={() => saveStockEdit(product.id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                          title="Save"
                        >
                          <span className="text-base font-bold">✓</span>
                        </button>
                        <button
                          onClick={cancelStockEdit}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          title="Cancel"
                        >
                          <span className="text-base font-bold">✕</span>
                        </button>
                      </div>
                    ) : pendingStockChanges[product.id] !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockDecrement(product.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200 hover:border-red-300"
                          disabled={pendingStockChanges[product.id] === 0}
                          title="Decrease stock"
                        >
                          <Minus className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </button>
                        <div className="min-w-[45px] px-3 py-1.5 rounded-lg text-sm font-semibold bg-orange-100 text-orange-800 border-2 border-orange-400 shadow-md animate-pulse">
                          {pendingStockChanges[product.id]}
                        </div>
                        <button
                          onClick={() => handleStockIncrement(product.id)}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                          title="Increase stock"
                        >
                          <Plus className="w-4 h-4 text-gray-600 hover:text-green-600" />
                        </button>
                        <button
                          onClick={() => confirmStockChange(product.id)}
                          className="ml-2 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                          title="Confirm and save to database"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => cancelStockChange(product.id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          title="Cancel changes"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockDecrement(product.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200 hover:border-red-300"
                          disabled={!product.stok || product.stok === 0}
                          title="Decrease stock"
                        >
                          <Minus className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </button>
                        <button
                          onClick={() => startEditingStock(product.id, product.stok || 0)}
                          className={`min-w-[45px] px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                            !product.stok || product.stok === 0 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                              : product.stok < 10 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                          }`}
                          title="Click to edit stock"
                        >
                          {product.stok ?? 0}
                        </button>
                        <button
                          onClick={() => handleStockIncrement(product.id)}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                          title="Increase stock"
                        >
                          <Plus className="w-4 h-4 text-gray-600 hover:text-green-600" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900 w-[100px]">
                    {product.sales ?? 0}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-[140px]">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewProduct(product.id)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product.id, product.nama || 'Product')}
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.nama || 'Product')}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
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

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onEditProduct={handleUpdateProduct}
        product={selectedProduct}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showProductDetail}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}
