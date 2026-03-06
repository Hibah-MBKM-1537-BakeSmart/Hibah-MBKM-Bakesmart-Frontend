import { lazy } from 'react';

// Lazy load heavy admin components
export const LazyAddProductModal = lazy(() => 
  import('@/components/adminPage/productsPage/Product/AddProductModal').then(module => ({
    default: module.AddProductModal
  }))
);

export const LazyEditProductModal = lazy(() => 
  import('@/components/adminPage/productsPage/Product/EditProductModal').then(module => ({
    default: module.EditProductModal
  }))
);

export const LazyProductDetailModal = lazy(() => 
  import('@/components/adminPage/productsPage/Product/ProductDetailModal').then(module => ({
    default: module.ProductDetailModal
  }))
);

export const LazyWhatsAppBlastModal = lazy(() => 
  import('@/components/adminPage/customersPage/WhatsAppBlastModal').then(module => ({
    default: module.WhatsAppBlastModal
  }))
);

export const LazyPrintModal = lazy(() => 
  import('@/components/adminPage/production/PrintModal').then(module => ({
    default: module.PrintModal
  }))
);