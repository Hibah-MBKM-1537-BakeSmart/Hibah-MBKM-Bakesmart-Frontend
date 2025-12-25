"use client";

import React, { useState, useEffect } from "react";
import { X, User, Phone, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminData, RoleData } from "@/app/contexts/UsersContext";

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminData | null;
  roles: RoleData[];
  onUpdateAdmin: (
    adminId: number,
    data: {
      nama?: string;
      no_hp?: string;
      password?: string;
      role?: string; // comma-separated role names
    }
  ) => Promise<void>;
}

export function EditAdminModal({
  isOpen,
  onClose,
  admin,
  roles,
  onUpdateAdmin,
}: EditAdminModalProps) {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when admin changes
  useEffect(() => {
    if (admin) {
      setNama(admin.nama || "");
      setNoHp(admin.no_hp || "");
      setPassword("");
      setSelectedRoles(admin.roles?.map((r) => r.id) || []);
      setChangePassword(false);
      setErrors({});
    }
  }, [admin]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen || !admin) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }

    if (!noHp.trim()) {
      newErrors.noHp = "Nomor HP wajib diisi";
    } else if (!/^[0-9]{10,15}$/.test(noHp.replace(/\D/g, ""))) {
      newErrors.noHp = "Format nomor HP tidak valid (10-15 digit)";
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Pilih minimal satu role";
    }

    if (changePassword) {
      if (!password.trim()) {
        newErrors.password = "Password wajib diisi";
      } else if (password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert selected role IDs to role names
      const roleNames = selectedRoles
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .join(",");

      const updateData: any = {
        nama,
        no_hp: noHp,
        role: roleNames,
      };

      if (changePassword && password) {
        updateData.password = password;
      }

      await onUpdateAdmin(admin.id, updateData);
      onClose();
    } catch (error) {
      console.error("Error updating admin:", error);
    } finally {
      setIsSubmitting(false);
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
      setErrors((prev) => ({ ...prev, roles: "" }));
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
            <h3 className="text-xl font-semibold text-gray-900">Edit Admin</h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="edit-nama"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Admin *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="edit-nama"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  if (errors.nama) setErrors((prev) => ({ ...prev, nama: "" }));
                }}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.nama ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan nama admin"
              />
            </div>
            {errors.nama && (
              <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="edit-noHp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor HP *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="edit-noHp"
                value={noHp}
                onChange={(e) => {
                  setNoHp(e.target.value);
                  if (errors.noHp) setErrors((prev) => ({ ...prev, noHp: "" }));
                }}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.noHp ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: 08123456789"
              />
            </div>
            {errors.noHp && (
              <p className="mt-1 text-sm text-red-600">{errors.noHp}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                Role *{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (bisa pilih lebih dari satu)
                </span>
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? `${getRoleColor(role.name)}`
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <span>✓</span>}
                      {role.name.toUpperCase()}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.roles && (
              <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
            )}
          </div>

          {/* Change Password Toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => {
                  setChangePassword(e.target.checked);
                  if (!e.target.checked) {
                    setPassword("");
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ubah Password</span>
            </label>
          </div>

          {/* Password Field */}
          {changePassword && (
            <div>
              <label
                htmlFor="edit-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="edit-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`w-full pl-3 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
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
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
