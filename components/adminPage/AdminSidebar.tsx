'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/app/contexts/AdminContext';
import {
  LayoutDashboard,
  Package,
  Calculator,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Factory,
  History,
  UserCheck
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'products',
    label: 'Products',
    href: '/admin/products',
    icon: Package
  },
  {
    id: 'production',
    label: 'Production',
    href: '/admin/production',
    icon: Factory
  },
  {
    id: 'kasir',
    label: 'Kasir',
    href: '/admin/kasir',
    icon: Calculator
  },
  {
    id: 'history',
    label: 'History',
    href: '/admin/history',
    icon: History
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/admin/customers',
    icon: UserCheck
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export function AdminSidebar() {
  const { state, toggleSidebar, logout } = useAdmin();
  const pathname = usePathname();

  return (
    <div className={`shadow-lg transition-all duration-300 flex flex-col h-full ${
      state.sidebarCollapsed ? 'w-16' : 'w-64'
    }`} style={{ backgroundColor: '#9B6D49' }}>
      {/* Logo Section */}
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#7b5235' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b6f47' }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            {!state.sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white font-admin-heading">BakeSmart</h1>
                <p className="text-xs text-gray-200 font-admin-body">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            {state.sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-200" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-200" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: '#8b6f47' } : {}}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-200'}`} />
              {!state.sidebarCollapsed && (
                <span className="font-medium font-admin-body">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - User Info and Logout */}
      <div className="flex-shrink-0 border-t" style={{ borderColor: '#7b5235' }}>
        {/* User Info */}
        {!state.sidebarCollapsed && state.user && (
          <div className="p-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#7b5235' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8b6f47' }}>
                <span className="text-white text-sm font-medium">
                  {state.user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate font-admin-heading">
                  {state.user.name}
                </p>
                <p className="text-xs text-gray-200 truncate font-admin-body">
                  {state.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200 w-full font-admin-body ${
              state.sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!state.sidebarCollapsed && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
