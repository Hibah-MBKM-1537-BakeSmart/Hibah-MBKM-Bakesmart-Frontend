'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('bakesmart_admin_auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          // Check if login is still valid (optional: add expiry check)
          if (parsed.username && parsed.role) {
            router.replace('/admin/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
      
      // No valid auth, redirect to login
      router.replace('/admin/login');
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#fefdf8' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#8b6f47' }}></div>
        <p className="font-admin-body" style={{ color: '#8b6f47' }}>Memeriksa otentikasi...</p>
      </div>
    </div>
  );
}
