'use client';

import React from 'react';
import { HistoryProvider } from '@/app/contexts/HistoryContext';
import { HistoryFilter } from '@/components/adminPage/historyPage/HistoryFilter';
import { OrderList } from '@/components/adminPage/historyPage/OrderList';
import { OrderDetailModal } from '@/components/adminPage/historyPage/OrderDetailModal';
import { History } from 'lucide-react';

function HistoryPageContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f9f7f4' }}>
          <History className="w-6 h-6" style={{ color: '#8b6f47' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-admin-heading" style={{ color: '#5d4037' }}>
            History Pesanan
          </h1>
          <p className="font-admin-body" style={{ color: '#8b6f47' }}>
            Kelola dan pantau semua pesanan yang masuk ke sistem
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <HistoryFilter />

      {/* Order List */}
      <OrderList />

      {/* Order Detail Modal */}
      <OrderDetailModal />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <HistoryProvider>
      <HistoryPageContent />
    </HistoryProvider>
  );
}
