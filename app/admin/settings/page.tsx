'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/adminPage';
import {
  Save,
  Upload,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Clock,
  DollarSign
} from 'lucide-react';

interface Settings {
  general: {
    businessName: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
    currency: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderNotifications: boolean;
    lowStockNotifications: boolean;
    userRegistrationNotifications: boolean;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    logo?: string;
  };
  security: {
    twoFactorAuth: boolean;
    passwordRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number;
  };
}

const initialSettings: Settings = {
  general: {
    businessName: 'BakeSmart',
    description: 'Premium bakery with fresh and delicious baked goods',
    email: 'admin@bakesmart.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Raya No. 123, Jakarta, Indonesia',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    language: 'id'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    lowStockNotifications: true,
    userRegistrationNotifications: false
  },
  appearance: {
    theme: 'light',
    primaryColor: '#f97316'
  },
  security: {
    twoFactorAuth: false,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    sessionTimeout: 30
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const timezoneOptions = [
    { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
    { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
    { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' }
  ];

  const currencyOptions = [
    { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
    { value: 'USD', label: 'US Dollar (USD)' }
  ];

  const languageOptions = [
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'en', label: 'English' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const updateGeneralSettings = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
  };

  const updateNotificationSettings = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const updateAppearanceSettings = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  const updateSecuritySettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          loading={saving}
          icon={Save}
        >
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Business Name"
                      value={settings.general.businessName}
                      onChange={(e) => updateGeneralSettings('businessName', e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={settings.general.email}
                      onChange={(e) => updateGeneralSettings('email', e.target.value)}
                      icon={Mail}
                    />
                    <Input
                      label="Phone"
                      value={settings.general.phone}
                      onChange={(e) => updateGeneralSettings('phone', e.target.value)}
                      icon={Smartphone}
                    />
                    <Select
                      label="Timezone"
                      value={settings.general.timezone}
                      onChange={(e) => updateGeneralSettings('timezone', e.target.value)}
                      options={timezoneOptions}
                    />
                    <Select
                      label="Currency"
                      value={settings.general.currency}
                      onChange={(e) => updateGeneralSettings('currency', e.target.value)}
                      options={currencyOptions}
                    />
                    <Select
                      label="Language"
                      value={settings.general.language}
                      onChange={(e) => updateGeneralSettings('language', e.target.value)}
                      options={languageOptions}
                    />
                  </div>
                  <div className="mt-6">
                    <Textarea
                      label="Business Description"
                      value={settings.general.description}
                      onChange={(e) => updateGeneralSettings('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="mt-6">
                    <Textarea
                      label="Address"
                      value={settings.general.address}
                      onChange={(e) => updateGeneralSettings('address', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateNotificationSettings('emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => updateNotificationSettings('smsNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive browser push notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => updateNotificationSettings('pushNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Order Notifications</h4>
                        <p className="text-sm text-gray-500">Get notified about new orders</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderNotifications}
                        onChange={(e) => updateNotificationSettings('orderNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Low Stock Notifications</h4>
                        <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.lowStockNotifications}
                        onChange={(e) => updateNotificationSettings('lowStockNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">User Registration Notifications</h4>
                        <p className="text-sm text-gray-500">Get notified when new users register</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.userRegistrationNotifications}
                        onChange={(e) => updateNotificationSettings('userRegistrationNotifications', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
                  <div className="space-y-6">
                    <Select
                      label="Theme"
                      value={settings.appearance.theme}
                      onChange={(e) => updateAppearanceSettings('theme', e.target.value)}
                      options={themeOptions}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateAppearanceSettings('primaryColor', e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" icon={Upload}>
                          Upload Logo
                        </Button>
                        <span className="text-sm text-gray-500">Recommended size: 200x60px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSecuritySettings('twoFactorAuth', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Password Requirements</h4>
                      <div className="space-y-3">
                        <Input
                          label="Minimum Length"
                          type="number"
                          value={settings.security.passwordRequirements.minLength}
                          onChange={(e) => updateSecuritySettings('passwordRequirements', {
                            ...settings.security.passwordRequirements,
                            minLength: parseInt(e.target.value)
                          })}
                          min="6"
                          max="20"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.security.passwordRequirements.requireUppercase}
                              onChange={(e) => updateSecuritySettings('passwordRequirements', {
                                ...settings.security.passwordRequirements,
                                requireUppercase: e.target.checked
                              })}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-2"
                            />
                            <label className="text-sm text-gray-700">Require uppercase letters</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.security.passwordRequirements.requireNumbers}
                              onChange={(e) => updateSecuritySettings('passwordRequirements', {
                                ...settings.security.passwordRequirements,
                                requireNumbers: e.target.checked
                              })}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-2"
                            />
                            <label className="text-sm text-gray-700">Require numbers</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.security.passwordRequirements.requireSymbols}
                              onChange={(e) => updateSecuritySettings('passwordRequirements', {
                                ...settings.security.passwordRequirements,
                                requireSymbols: e.target.checked
                              })}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-2"
                            />
                            <label className="text-sm text-gray-700">Require special characters</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                      icon={Clock}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
