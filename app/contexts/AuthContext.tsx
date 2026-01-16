"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  UserRole, 
  parseRoles, 
  canAccessRoute, 
  getDefaultRedirect,
  getFirstAccessibleRoute,
  PUBLIC_ROUTES,
} from "@/lib/rbac";

interface AuthUser {
  username: string;
  roles: UserRole[];
  loginTime: string;
  token?: string;
  userId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    username: string,
    roles: UserRole[],
    token?: string,
    userId?: number
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccess: (path: string) => boolean;
  primaryRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const authData = localStorage.getItem("bakesmart_admin_auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.username && (parsed.roles || parsed.role)) {
          // Support both new 'roles' array and legacy 'role' string
          const roles = parsed.roles || parseRoles([parsed.role]);
          setUser({
            ...parsed,
            roles: roles,
          });
        } else {
          localStorage.removeItem("bakesmart_admin_auth");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("bakesmart_admin_auth");
    }
    setIsLoading(false);
  };

  const login = (
    username: string,
    roles: UserRole[],
    token?: string,
    userId?: number
  ) => {
    const userData: AuthUser = {
      username,
      roles,
      loginTime: new Date().toISOString(),
      token,
      userId,
    };
    localStorage.setItem("bakesmart_admin_auth", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("bakesmart_admin_auth");
    setUser(null);
    router.push("/admin/login");
  };

  /**
   * Check if the current user has a specific role.
   * @param role - Single role or array of roles to check
   * @returns boolean - True if user has any of the specified roles
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user?.roles) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return user.roles.some(r => rolesToCheck.includes(r));
  };

  /**
   * Check if the current user can access a specific path.
   * @param path - The URL path to check
   * @returns boolean - True if user can access the path
   */
  const canAccess = (path: string): boolean => {
    if (!user?.roles || user.roles.length === 0) return false;
    return canAccessRoute(user.roles, path);
  };

  /**
   * Get the primary (first) role of the current user.
   */
  const primaryRole = user?.roles?.[0] || null;

  // Redirect logic based on RBAC
  useEffect(() => {
    if (isLoading) return;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) return;

    // Not authenticated - redirect to login
    if (!user) {
      router.push("/admin/login");
      return;
    }

    // Check if user can access current route
    if (!canAccessRoute(user.roles, pathname)) {
      // Redirect to first accessible route
      const redirectPath = getFirstAccessibleRoute(user.roles);
      router.push(redirectPath);
    }
  }, [user, isLoading, pathname, router]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    canAccess,
    primaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
