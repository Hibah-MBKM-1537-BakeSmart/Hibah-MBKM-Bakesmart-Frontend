"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  SortAsc,
  Upload,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useCustomers } from "../../../app/contexts/CustomersContext";
import { useAdminTranslation } from "../../../app/contexts/AdminTranslationContext";

export default function CustomersFilter() {
  const { t } = useAdminTranslation();
  const {
    state,
    updateFilters,
    exportToCSV,
    exportToExcel,
    refreshCustomers,
    importCustomers,
    openWhatsAppBlast,
  } = useCustomers();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const sortOptions = [
    { value: "newest", labelKey: "customers.newestFirst" },
    { value: "oldest", labelKey: "customers.oldestFirst" },
    { value: "most_active", labelKey: "customers.mostActive" },
    { value: "name_asc", labelKey: "customers.nameAsc" },
    { value: "name_desc", labelKey: "customers.nameDesc" },
  ];

  const roleOptions = [
    { value: "all", labelKey: "customers.allRoles" },
    { value: "user", labelKey: "customers.users" },
    { value: "admin", labelKey: "customers.admins" },
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

  const handleExport = (type: "csv" | "excel") => {
    if (type === "csv") {
      exportToCSV();
    } else {
      exportToExcel();
    }
    setShowExportMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        const result = await importCustomers(file);
        alert(
          `Import berhasil! ${result?.data?.inserted || 0} data ditambahkan, ${
            result?.data?.skipped || 0
          } data dilewati.`
        );
      } catch (error) {
        alert("Failed to import customers");
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t("customers.searchCustomers")}
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
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey as any)}
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
              {t("customers.sort")}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      state.filters.sortBy === option.value
                        ? "bg-[#f5f1eb] text-[#9B6D49]"
                        : ""
                    }`}
                  >
                    {t(option.labelKey as any)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter text-sm disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t("customers.import")}
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[#9B6D49] text-white rounded-lg hover:bg-[#8b6f47] font-inter text-sm"
            >
              <Download className="h-4 w-4" />
              {t("common.export")}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 rounded-t-lg"
                >
                  {t("customers.exportCSV")}
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full text-left px-4 py-2 text-sm font-inter hover:bg-gray-50 rounded-b-lg"
                >
                  {t("customers.exportExcel")}
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Blast Button */}
          <button
            onClick={openWhatsAppBlast}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-inter text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            {t("customers.waBlast")}
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshCustomers}
            disabled={state.isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-inter text-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`}
            />
            {t("customers.refresh")}
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {state.filters.searchQuery && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f5f1eb] text-[#9B6D49] rounded-full text-sm font-inter">
            {t("history.search")}: "{state.filters.searchQuery}"
            <button
              onClick={() => updateFilters({ searchQuery: "" })}
              className="ml-1 hover:text-[#8b6f47]"
            >
              ×
            </button>
          </span>
        )}
        {state.filters.role !== "all" && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f5f1eb] text-[#9B6D49] rounded-full text-sm font-inter">
            {t("users.userRole")}: {state.filters.role}
            <button
              onClick={() => updateFilters({ role: "all" })}
              className="ml-1 hover:text-[#8b6f47]"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 font-inter">
        {t("customers.showing")} {state.filteredCustomers.length} {t("customers.of")} {state.customers.length}{" "}
        {t("sidebar.customers").toLowerCase()}
      </div>
    </div>
  );
}
