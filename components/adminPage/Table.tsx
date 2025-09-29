'use client';

import React from 'react';

interface TableProps {
  columns: {
    key: string;
    label: string;
    className?: string;
  }[];
  data: any[];
  renderCell: (column: string, row: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
}

export function Table({ 
  columns, 
  data, 
  renderCell, 
  emptyMessage = "No data available", 
  emptyIcon: EmptyIcon 
}: TableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {renderCell(column.key, row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          {EmptyIcon && (
            <EmptyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
