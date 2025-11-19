'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthUser {
  username: string;
  role: 'admin' | 'super_admin';
  loginTime: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, role: 'admin' | 'super_admin') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const authData = localStorage.getItem('bakesmart_admin_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.username && parsed.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem('bakesmart_admin_auth');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('bakesmart_admin_auth');
    }
    setIsLoading(false);
  };

  const login = (username: string, role: 'admin' | 'super_admin') => {
    const userData = {
      username,
      role,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('bakesmart_admin_auth', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bakesmart_admin_auth');
    setUser(null);
    router.push('/admin/login');
  };

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}