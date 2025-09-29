'use client';

import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { useProduction } from '@/app/contexts/ProductionContext';

export function DateFilter() {
  const { selectedDate, setSelectedDate, dateRange, setDateRange } = useProduction();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSelectedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    setDateRange({ ...dateRange, start: newStartDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    setDateRange({ ...dateRange, end: newEndDate });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e0d5c7' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" style={{ color: '#8b6f47' }} />
          <h2 className="text-lg font-semibold font-admin-heading" style={{ color: '#5d4037' }}>
            Date Filters
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Single Date Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium font-admin-body" style={{ color: '#8b6f47' }}>
            Selected Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b6f47' }} />
            <input
              type="date"
              value={formatDate(selectedDate)}
              onChange={handleSelectedDateChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
        </div>

        {/* Date Range Start */}
        <div className="space-y-2">
          <label className="block text-sm font-medium font-admin-body" style={{ color: '#8b6f47' }}>
            Range Start
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b6f47' }} />
            <input
              type="date"
              value={formatDate(dateRange.start)}
              onChange={handleStartDateChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
        </div>

        {/* Date Range End */}
        <div className="space-y-2">
          <label className="block text-sm font-medium font-admin-body" style={{ color: '#8b6f47' }}>
            Range End
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b6f47' }} />
            <input
              type="date"
              value={formatDate(dateRange.end)}
              onChange={handleEndDateChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 font-admin-body"
              style={{ 
                borderColor: '#e0d5c7'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Date Presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-3 py-1 text-sm rounded-lg border transition-colors font-admin-body"
          style={{ 
            borderColor: '#e0d5c7',
            color: '#8b6f47'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f7f4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Today
        </button>
        <button
          onClick={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
          className="px-3 py-1 text-sm rounded-lg border transition-colors font-admin-body"
          style={{ 
            borderColor: '#e0d5c7',
            color: '#8b6f47'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f7f4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Tomorrow
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            setDateRange({ start: today, end: nextWeek });
          }}
          className="px-3 py-1 text-sm rounded-lg border transition-colors font-admin-body"
          style={{ 
            borderColor: '#e0d5c7',
            color: '#8b6f47'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f7f4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Next 7 Days
        </button>
      </div>
    </div>
  );
}
