"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";
import { usePageTransition } from "@/hooks/usePageTransition";
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
  UserCheck,
  Ticket,
  TrendingUp,
} from "lucide-react";

interface MenuItem {
  id: string;
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    labelKey: "sidebar.dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "statistics",
    labelKey: "sidebar.statistics",
    href: "/admin/statistics",
    icon: TrendingUp,
  },
  {
    id: "products",
    labelKey: "sidebar.products",
    href: "/admin/products",
    icon: Package,
  },
  {
    id: "production",
    labelKey: "sidebar.production",
    href: "/admin/production",
    icon: Factory,
  },
  {
    id: "kasir",
    labelKey: "sidebar.kasir",
    href: "/admin/kasir",
    icon: Calculator,
  },
  {
    id: "history",
    labelKey: "sidebar.history",
    href: "/admin/history",
    icon: History,
  },
  {
    id: "customers",
    labelKey: "sidebar.customers",
    href: "/admin/customers",
    icon: UserCheck,
  },
  {
    id: "vouchers",
    labelKey: "sidebar.vouchers",
    href: "/admin/vouchers",
    icon: Ticket,
  },
  {
    id: "users",
    labelKey: "sidebar.users",
    href: "/admin/users",
    icon: Users,
  },
  {
    id: "settings",
    labelKey: "sidebar.settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useAdmin();
  const { user, logout } = useAuth();
  const { t } = useAdminTranslation();
  const { startTransition } = usePageTransition();
  const pathname = usePathname();

  // Memoize menu items to prevent re-creation on every render
  const menuElements = useMemo(() => {
    return menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      const label = t(item.labelKey);

      return (
        <Link
          key={item.id}
          href={item.href}
          prefetch={true}
          onClick={startTransition}
          className={`flex items-center ${state.sidebarCollapsed ? "justify-center" : "space-x-3"
            } px-3 ${state.sidebarCollapsed ? "py-3" : "py-2"
            } rounded-lg transition-all duration-200 group ${isActive
              ? "text-white font-medium shadow-md"
              : "text-gray-200 hover:bg-white/10 hover:text-white hover:shadow-sm"
            }`}
          style={isActive ? { backgroundColor: "#8b6f47" } : {}}
          title={state.sidebarCollapsed ? label : ""}
        >
          <Icon
            className={`${state.sidebarCollapsed ? "w-8 h-8" : "w-5 h-5"
              } transition-transform duration-200 ${isActive
                ? "text-white scale-110"
                : "text-gray-200 group-hover:scale-105"
              }`}
          />
          {!state.sidebarCollapsed && (
            <span className="font-medium font-admin-body transition-all duration-200">
              {label}
            </span>
          )}
          {isActive && !state.sidebarCollapsed && (
            <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse"></div>
          )}
        </Link>
      );
    });
  }, [pathname, state.sidebarCollapsed, startTransition, t]);

  return (
    <div
      className={`shadow-lg transition-all duration-300 flex flex-col h-full ${state.sidebarCollapsed ? "w-20" : "w-64"
        }`}
      style={{ backgroundColor: "#9B6D49" }}
    >
      {/* Logo Section */}
      <div
        className="p-4 border-b flex-shrink-0"
        style={{ borderColor: "#7b5235" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {state.sidebarCollapsed ? (
              /* Expand button when collapsed - shows '>' */
              <button
                onClick={toggleSidebar}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/10"
                style={{ backgroundColor: "#8b6f47" }}
                title="Expand Sidebar"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            ) : (
              /* Store icon when expanded */
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#8b6f47" }}
              >
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
            {!state.sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white font-admin-heading">
                  BakeSmart
                </h1>
                <p className="text-xs text-gray-200 font-admin-body">
                  Admin Panel
                </p>
              </div>
            )}
          </div>
          {!state.sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-200" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">{menuElements}</nav>

      {/* Bottom Section - User Info and Logout */}
      <div
        className="flex-shrink-0 border-t"
        style={{ borderColor: "#7b5235" }}
      >
        {/* User Info */}
        {user && (
          <div className="p-4">
            {state.sidebarCollapsed ? (
              /* Collapsed: Show only avatar */
              <div className="flex justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#7b5235" }}
                  title={user.username}
                >
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              /* Expanded: Show full user info */
              <div
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ backgroundColor: "#7b5235" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8b6f47" }}
                >
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate font-admin-heading">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-200 truncate font-admin-body">
                    {user.role === "super_admin" ? t("users.superAdmin") : t("users.admin")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className={`flex items-center space-x-3 px-3 ${state.sidebarCollapsed ? "py-3" : "py-2"
              } rounded-lg transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200 w-full font-admin-body ${state.sidebarCollapsed ? "justify-center" : ""
              }`}
            title={state.sidebarCollapsed ? t("header.signOut") : ""}
          >
            <LogOut
              className={`${state.sidebarCollapsed ? "w-8 h-8" : "w-5 h-5"
                } transition-all duration-200`}
            />
            {!state.sidebarCollapsed && (
              <span className="font-medium">{t("header.signOut")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
