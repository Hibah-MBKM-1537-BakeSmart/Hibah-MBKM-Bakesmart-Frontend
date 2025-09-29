'use client';

import React from 'react';
import { Package, Clock, ChefHat, CheckCircle, CreditCard } from 'lucide-react';
import { useProduction } from '@/app/contexts/ProductionContext';

export function ProductionStats() {
  const { summary } = useProduction();

  const stats = [
    {
      title: 'Total Orders',
      value: summary.totalOrders,
      icon: Package,
      color: '#8b6f47',
      bgColor: '#f9f7f4'
    },
    {
      title: 'Pending',
      value: summary.pending,
      icon: Clock,
      color: '#d97706',
      bgColor: '#fef3c7'
    },
    {
      title: 'Verifying',
      value: summary.verifying,
      icon: Package,
      color: '#6366f1',
      bgColor: '#e0e7ff'
    },
    {
      title: 'Paid',
      value: summary.paid,
      icon: CreditCard,
      color: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
      title: 'Baking',
      value: summary.baked,
      icon: ChefHat,
      color: '#2563eb',
      bgColor: '#dbeafe'
    },
    {
      title: 'Completed',
      value: summary.completed,
      icon: CheckCircle,
      color: '#059669',
      bgColor: '#d1fae5'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border p-6" 
            style={{ borderColor: '#e0d5c7' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium font-admin-body" style={{ color: '#8b6f47' }}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-2 font-admin-heading" style={{ color: '#5d4037' }}>
                  {stat.value}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: stat.bgColor }}
              >
                <Icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
