'use client';

import React from 'react';
import { Eye, Phone, Mail, MapPin, Star, Crown } from 'lucide-react';
import { useCustomers } from '../../../app/contexts/CustomersContext';
import { useAdminTranslation } from '../../../app/contexts/AdminTranslationContext';

export default function CustomersTable() {
  const { t } = useAdminTranslation();
  const { state, selectCustomer, setCurrentPage } = useCustomers();

  // Pagination calculations
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const currentCustomers = state.filteredCustomers.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700 font-inter">
          {t("customers.showing")} {startIndex + 1} {t("customers.to")} {Math.min(endIndex, state.filteredCustomers.length)} {t("customers.of")}{' '}
          {state.filteredCustomers.length} {t("customers.results")}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(state.currentPage - 1)}
            disabled={state.currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
          >
            {t("customers.previous")}
          </button>
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm font-medium rounded-md font-inter ${
                page === state.currentPage
                  ? 'text-[#9B6D49] bg-[#f5f1eb] border border-[#9B6D49]'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(state.currentPage + 1)}
            disabled={state.currentPage === state.totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
          >
            {t("customers.next")}
          </button>
        </div>
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B6D49] mx-auto"></div>
            <p className="mt-2 text-gray-600 font-inter">{t("customers.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentCustomers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 font-poppins">{t("customers.noCustomers")}</h3>
            <p className="mt-1 text-sm text-gray-500 font-inter">
              {t("customers.adjustFilter")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.customer")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.contactInfo")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.joinDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.purchases")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.totalSpent")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.lastPurchase")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                {t("customers.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#9B6D49] flex items-center justify-center">
                        <span className="text-sm font-medium text-white font-poppins">
                          {customer.nama.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 font-poppins">
                          {customer.nama}
                        </div>
                        {customer.role === 'admin' && (
                          <div title={t("users.admin")}>
                            <Crown className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 font-inter">ID: {customer.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900 font-inter">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {customer.no_hp}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 font-inter">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {customer.role}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 font-inter">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(customer.created_at).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                  {customer.totalPurchases}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.lastPurchase ? (
                    <div>
                      <div className="text-sm text-gray-900 font-inter">
                        {customer.lastPurchase.product?.nama || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500 font-inter">
                        {new Date(customer.lastPurchase.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 font-inter">{t("customers.noPurchaseYet")}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => selectCustomer(customer)}
                    className="inline-flex items-center gap-1 text-[#9B6D49] hover:text-[#8b6f47] font-inter"
                  >
                    <Eye className="h-4 w-4" />
                    {t("customers.viewDetails")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
