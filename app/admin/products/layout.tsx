'use client';

import { CategoriesProvider } from '@/app/contexts/CategoriesContext';
import { ProductsProvider } from '@/app/contexts/ProductsContext';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoriesProvider>
      <ProductsProvider>
        {children}
      </ProductsProvider>
    </CategoriesProvider>
  );
}
