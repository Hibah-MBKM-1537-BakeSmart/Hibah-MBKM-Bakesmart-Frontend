'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/adminPage';
import { AdminHeader } from '@/components/adminPage';
import { PageLoading } from '@/components/ui/PageLoading';
import { usePageTransition } from '@/hooks/usePageTransition';
import { PUBLIC_ROUTES, getFirstAccessibleRoute, canAccessRoute } from '@/lib/rbac';
import { useEffect, useState } from 'react';

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isLoading: isPageLoading } = usePageTransition();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check authorization when user or pathname changes
  useEffect(() => {
    if (isLoading) {
      setIsAuthorized(null);
      return;
    }

    // Public routes are always accessible
    if (PUBLIC_ROUTES.includes(pathname)) {
      setIsAuthorized(true);
      return;
    }

    // Not authenticated
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    // Check if user can access the current route
    const hasAccess = canAccessRoute(user.roles, pathname);
    
    if (!hasAccess) {
      // Redirect to first accessible route
      const redirectPath = getFirstAccessibleRoute(user.roles);
      router.replace(redirectPath);
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoading, pathname, router]);

  // Show loading spinner while checking auth
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#fefdf8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#8b6f47' }}></div>
          <p className="font-admin-body" style={{ color: '#8b6f47' }}>Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Login page - no sidebar/header layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Require authentication for other admin pages
  if (!user || !isAuthorized) {
    return null; // AuthProvider will handle redirect
  }

  // Admin pages with sidebar and header
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f5f1eb' }}>
      {/* Page Loading Overlay */}
      <PageLoading isLoading={isPageLoading} />
      
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}