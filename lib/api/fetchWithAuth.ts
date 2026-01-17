/**
 * Utility untuk melakukan fetch request dengan Authorization header
 * Digunakan untuk API routes (server-side) dan client-side requests
 */

import { BACKEND_URL } from "@/lib/utils";

// ============================================
// Server-side utilities (untuk API Routes)
// ============================================

/**
 * Extract Authorization header dari incoming request
 * Digunakan di API routes untuk meneruskan token ke backend
 */
export function getAuthHeader(request: Request): string | null {
  return request.headers.get("Authorization");
}

/**
 * Buat headers dengan Authorization untuk request ke backend
 * @param request - Incoming request dari client (untuk extract auth header)
 * @param additionalHeaders - Headers tambahan
 */
export function createAuthHeaders(
  request: Request,
  additionalHeaders: Record<string, string> = {}
): HeadersInit {
  const authHeader = getAuthHeader(request);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  return headers;
}

/**
 * Fetch dengan Authorization header dari incoming request
 * Untuk digunakan di Next.js API routes
 */
export async function fetchWithAuthFromRequest(
  url: string,
  request: Request,
  options: RequestInit = {}
): Promise<Response> {
  const headers = createAuthHeaders(request, options.headers as Record<string, string>);
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// ============================================
// Client-side utilities
// ============================================

const AUTH_STORAGE_KEY = "bakesmart_admin_auth";

/**
 * Get token from localStorage (client-side only)
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || null;
    }
  } catch (error) {
    console.error("Error getting token from localStorage:", error);
  }
  return null;
}

/**
 * Create headers with Authorization token for client-side requests
 */
export function createClientAuthHeaders(
  additionalHeaders: Record<string, string> = {}
): HeadersInit {
  const token = getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch with Authorization header (client-side)
 * Automatically includes Bearer token from localStorage
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = createClientAuthHeaders(options.headers as Record<string, string>);
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Type-safe wrapper for fetchWithAuth with JSON response
 */
export async function fetchWithAuthJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// ============================================
// Backend URL helper
// ============================================

/**
 * Get full backend URL
 */
export function getBackendUrl(path: string): string {
  const baseUrl = BACKEND_URL.endsWith("/") 
    ? BACKEND_URL.slice(0, -1) 
    : BACKEND_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
