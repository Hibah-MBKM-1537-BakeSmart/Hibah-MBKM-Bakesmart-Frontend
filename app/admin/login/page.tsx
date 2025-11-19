'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Eye, EyeOff, Lock, User, AlertCircle, Coffee } from 'lucide-react';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginError {
  message: string;
  field?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  // Demo credentials
  const validCredentials = {
    admin: 'admin123',
    superadmin: 'super123'
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!form.username.trim()) {
      setError({ message: 'Username harus diisi', field: 'username' });
      setIsLoading(false);
      return;
    }

    if (!form.password.trim()) {
      setError({ message: 'Password harus diisi', field: 'password' });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // Check credentials
      if (
        (form.username === 'admin' && form.password === validCredentials.admin) ||
        (form.username === 'superadmin' && form.password === validCredentials.superadmin)
      ) {
        // Use AuthContext login
        const role = form.username === 'superadmin' ? 'super_admin' : 'admin';
        login(form.username, role);
        router.push('/admin/dashboard');
      } else {
        setError({ message: 'Username atau password salah!' });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fefdf8' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d7ccc8' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8b6f47' }}>
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-admin-heading mb-2" style={{ color: '#5d4037' }}>
            BakeSmart Admin
          </h1>
          <p className="font-admin-body" style={{ color: '#8b6f47' }}>
            Masuk ke sistem administrasi
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: '#e0d5c7' }}>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error.message}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4" style={{ color: '#8b6f47' }} />
                </div>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md font-admin-body focus:outline-none focus:ring-2 ${
                    error?.field === 'username' 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Masukkan username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 font-admin-body" style={{ color: '#5d4037' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4" style={{ color: '#8b6f47' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md font-admin-body focus:outline-none focus:ring-2 ${
                    error?.field === 'password' 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Masukkan password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" style={{ color: '#8b6f47' }} />
                  ) : (
                    <Eye className="h-4 w-4" style={{ color: '#8b6f47' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#8b6f47' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> username: admin, password: admin123</div>
            <div><strong>Super Admin:</strong> username: superadmin, password: super123</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs font-admin-body" style={{ color: '#8b6f47' }}>
            © 2024 BakeSmart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}