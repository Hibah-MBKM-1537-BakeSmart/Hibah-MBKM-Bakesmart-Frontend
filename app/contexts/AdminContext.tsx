'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
}

interface AdminState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface AdminContextType {
  state: AdminState;
  login: (user: User) => void;
  logout: () => void;
  toggleSidebar: () => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AdminState>({
    user: null,
    isAuthenticated: false,
    sidebarCollapsed: false,
    notifications: []
  });

  // Demo user for development
  useEffect(() => {
    const demoUser: User = {
      id: '1',
      name: 'Admin BakeSmart',
      email: 'admin@bakesmart.com',
      role: 'admin',
      avatar: undefined
    };

    setState(prev => ({
      ...prev,
      user: demoUser,
      isAuthenticated: true,
      notifications: [
        {
          id: '1',
          title: 'New Order',
          message: 'You have received a new order #12345',
          type: 'info',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          title: 'Low Stock Alert',
          message: 'Chocolate Cake is running low on stock',
          type: 'warning',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        }
      ]
    }));
  }, []);

  const login = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true
    }));
  };

  const logout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('bakesmart_admin_auth');
    
    // Update state
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false
    }));
    
    // Redirect to login page
    router.push('/admin/login');
  };

  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));
  };

  const contextValue: AdminContextType = {
    state,
    login,
    logout,
    toggleSidebar,
    markNotificationAsRead,
    addNotification
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
