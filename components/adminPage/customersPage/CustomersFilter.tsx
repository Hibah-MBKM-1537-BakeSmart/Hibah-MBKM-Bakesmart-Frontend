'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, SortAsc } from 'lucide-react';
import { useCustomers } from '../../../app/contexts/CustomersContext';

export default function CustomersFilter() {
  const { state, updateFilters, exportToCSV, exportToExcel, refreshCustomers } = useCustomers();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_active', label: 'Most Active' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'user', label: 'Users' },
    { value: 'admin', label: 'Admins' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ role: e.target.value as any });
  };

  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy: sortBy as any });
    setShowSortMenu(false);
  };

  const handleExport = (type: 'csv' | 'excel') => {
    if (type === 'csv') {
      exportToCSV();
    } else {
      exportToExcel();
    }
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={state.filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6D49] focus:border-[#9B6D49] font-inter"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={state.filters.role}
              onChange={handleRoleChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 font-inter text-sm focus:ring-2 focus:ring-[#9B6D49] focus:border-[#9B6D49]"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter text-sm"
            >
              <SortAsc className="h-4 w-4" />
              Sort
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      state.filters.sortBy === option.value ? 'bg-[#f5f1eb] text-[#9B6D49]' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[#9B6D49] text-white rounded-lg hover:bg-[#8b6f47] font-inter text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 rounded-t-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 rounded-b-lg"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshCustomers}
            disabled={state.isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {state.filters.searchQuery && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f5f1eb] text-[#9B6D49] rounded-full text-sm font-inter">
            Search: "{state.filters.searchQuery}"
            <button
              onClick={() => updateFilters({ searchQuery: '' })}
              className="ml-1 hover:text-[#8b6f47]"
            >
              ×
            </button>
          </span>
        )}
        {state.filters.role !== 'all' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f5f1eb] text-[#9B6D49] rounded-full text-sm font-inter">
            Role: {state.filters.role}
            <button
              onClick={() => updateFilters({ role: 'all' })}
              className="ml-1 hover:text-[#8b6f47]"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 font-inter">
        Showing {state.filteredCustomers.length} of {state.customers.length} customers
      </div>
    </div>
  );
}
