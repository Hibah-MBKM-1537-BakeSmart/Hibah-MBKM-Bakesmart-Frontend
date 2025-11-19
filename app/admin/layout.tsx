import type React from 'react';
import { Poppins, Inter } from 'next/font/google';
import { AdminSidebar } from '@/components/adminPage';
import { AdminHeader } from '@/components/adminPage';
import { AdminProvider } from '@/app/contexts/AdminContext';
import { CategoriesProvider } from '@/app/contexts/CategoriesContext';
import { ProductsProvider } from '@/app/contexts/ProductsContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import AdminAuthWrapper from './AdminAuthWrapper';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminProvider>
        <CategoriesProvider>
          <ProductsProvider>
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
          </ProductsProvider>
        </CategoriesProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
