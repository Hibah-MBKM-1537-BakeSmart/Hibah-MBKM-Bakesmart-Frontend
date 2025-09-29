'use client';

import React from 'react';
import { useHistory } from '@/app/contexts/HistoryContext';
import {
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export function HistoryFilter() {
  const { state, updateFilters, exportToCSV, refreshOrders } = useHistory();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as any;
    updateFilters({ period });
    
    // Reset custom date range when changing period
    if (period !== 'custom') {
      updateFilters({
        dateRange: { from: null, to: null }
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    updateFilters({
      dateRange: {
        ...state.filters.dateRange,
        from: date
      }
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    updateFilters({
      dateRange: {
        ...state.filters.dateRange,
        to: date
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6" style={{ borderColor: '#e0d5c7' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" style={{ color: '#8b6f47' }} />
          <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
            Filter Pesanan
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshOrders}
            disabled={state.isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors font-admin-body"
            style={{ 
              borderColor: '#e0d5c7',
              color: '#8b6f47'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors font-admin-body"
            style={{ backgroundColor: '#8b6f47' }}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4" style={{ color: '#8b6f47' }} />
            </div>
            <input
              type="text"
              placeholder="Order ID, nama, atau nomor telepon..."
              value={state.filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
        </div>

        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
            Periode
          </label>
          <select
            value={state.filters.period}
            onChange={handlePeriodChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
            style={{ 
              borderColor: '#e0d5c7'
            }}
          >
            <option value="all">Semua</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
            Status Pesanan
          </label>
          <select
            value={state.filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
            style={{ 
              borderColor: '#e0d5c7'
            }}
          >
            <option value="">Semua</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range (only shown when period is 'custom') */}
      {state.filters.period === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
              Dari Tanggal
            </label>
            <input
              type="date"
              value={state.filters.dateRange.from?.toISOString().split('T')[0] || ''}
              onChange={handleDateFromChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={state.filters.dateRange.to?.toISOString().split('T')[0] || ''}
              onChange={handleDateToChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm font-admin-body" style={{ color: '#8b6f47' }}>
        <span>
          Menampilkan {state.filteredOrders.length} dari {state.orders.length} pesanan
        </span>
        {state.filters.searchQuery && (
          <span>
            untuk "{state.filters.searchQuery}"
          </span>
        )}
      </div>
    </div>
  );
}
