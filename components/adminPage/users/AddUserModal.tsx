"use client";

import React, { useState, useEffect } from "react";
import { X, User, Phone, Shield, Eye, EyeOff, Loader2 } from "lucide-react";

interface RoleData {
  id: number;
  name: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: NewUserData) => void;
  roles: RoleData[];
}

interface NewUserData {
  name: string;
  email: string;
  phone: string;
  role: string; // comma-separated role names for multiple roles
  password: string;
}

export function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
  roles,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<NewUserData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewUserData | 'roles', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewUserData | 'roles', string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Format nomor telepon tidak valid (10-15 digit)";
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Pilih minimal satu role";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert selected role IDs to role names (comma-separated)
      const roleNames = selectedRoles
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .join(",");

      const userData: NewUserData = {
        ...formData,
        role: roleNames,
      };

      await onAddUser(userData);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
      });
      setSelectedRoles([]);
      setErrors({});
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
    // Clear role error
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: undefined }));
    }
  };

  const getRoleColor = (roleName: string): string => {
    const colors: Record<string, string> = {
      owner: "bg-purple-100 text-purple-800 border-purple-300",
      baker: "bg-orange-100 text-orange-800 border-orange-300",
      cashier: "bg-blue-100 text-blue-800 border-blue-300",
      packager: "bg-green-100 text-green-800 border-green-300",
    };
    return (
      colors[roleName.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Tambah User Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Admin *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan nama admin"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor HP *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="08123456789"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Role Field - Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role * (Pilih minimal 1)
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(
                      role.name
                    )}`}
                  >
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Role Description */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Keterangan Role:
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>
                <strong>Owner:</strong> Pemilik/Manajer utama toko
              </div>
              <div>
                <strong>Baker:</strong> Staff produksi/pembuat kue
              </div>
              <div>
                <strong>Cashier:</strong> Staff kasir/penjualan
              </div>
              <div>
                <strong>Packager:</strong> Staff pengemasan
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Tambah Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
