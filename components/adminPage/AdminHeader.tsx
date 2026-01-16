"use client";

import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/app/contexts/AdminContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { useAdminTranslation } from "@/app/contexts/AdminTranslationContext";
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher";
import { Bell, User, Settings, LogOut, Shield } from "lucide-react";

export function AdminHeader() {
  const { state, markNotificationAsRead } = useAdmin();
  const { user, logout } = useAuth();
  const { t } = useAdminTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="shadow-sm border-b px-6 py-4"
      style={{ backgroundColor: "#f5f1eb", borderColor: "#e0d5c7" }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu removed - sidebar has its own expand button */}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <AdminLanguageSwitcher />

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Bell className="w-5 h-5" style={{ color: "#8b6f47" }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
                style={{ borderColor: "#e0d5c7" }}
              >
                <div
                  className="p-4 border-b"
                  style={{ borderColor: "#e0d5c7" }}
                >
                  <h3
                    className="text-lg font-medium font-admin-heading"
                    style={{ color: "#5d4037" }}
                  >
                    {t("header.notifications")}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <div
                      className="p-4 text-center"
                      style={{ color: "#8b6f47" }}
                    >
                      {t("header.noNotifications")}
                    </div>
                  ) : (
                    state.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""
                          }`}
                        style={{ borderColor: "#f0f0f0" }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4
                              className="text-sm font-medium font-admin-heading"
                              style={{ color: "#5d4037" }}
                            >
                              {notification.title}
                            </h4>
                            <p
                              className="text-sm mt-1"
                              style={{ color: "#8b6f47" }}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div
                              className="w-2 h-2 rounded-full ml-2 mt-1"
                              style={{ backgroundColor: "#8b6f47" }}
                            ></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    user?.roles.includes("owner") ? "#7b1fa2" : "#8b6f47",
                }}
              >
                {user?.roles.includes("owner") ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p
                  className="text-sm font-medium font-admin-heading"
                  style={{ color: "#5d4037" }}
                >
                  {user?.username}
                </p>
                <p className="text-xs" style={{ color: "#8b6f47" }}>
                  {user?.roles.includes("owner") ? t("users.superAdmin") : t("users.admin")}
                </p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50"
                style={{ borderColor: "#e0d5c7" }}
              >
                <div className="py-1">
                  <button
                    className="flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left font-admin-body"
                    style={{ color: "#5d4037" }}
                  >
                    <User className="w-4 h-4" />
                    <span>{t("header.profile")}</span>
                  </button>
                  <button
                    className="flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left font-admin-body"
                    style={{ color: "#5d4037" }}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t("header.settings")}</span>
                  </button>
                  <hr className="my-1" style={{ borderColor: "#e0d5c7" }} />
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left font-admin-body"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("header.signOut")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
