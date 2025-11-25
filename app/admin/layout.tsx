import type React from 'react';
import { Poppins, Inter } from 'next/font/google';
import { AdminProvider } from '@/app/contexts/AdminContext';
import { AdminProvider as UsersProvider } from '@/app/contexts/UsersContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ToastProvider } from '@/app/contexts/ToastContext';
import AdminAuthWrapper from './AdminAuthWrapper';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap', // Add display swap for faster font loading
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminProvider>
        <UsersProvider>
          <ToastProvider>
            <div 
              className={`${poppins.variable} ${inter.variable}`}
              style={{ 
                fontFamily: 'var(--font-inter), sans-serif'
              }}
            >
              <AdminAuthWrapper>
                {children}
              </AdminAuthWrapper>
            </div>
          </ToastProvider>
        </UsersProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
