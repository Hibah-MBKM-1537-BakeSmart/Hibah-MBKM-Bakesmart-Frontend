'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// Role interface matching backend response
export interface RoleData {
  id: number;
  name: string;
}

// Updated interface to match backend response with multiple roles
export interface AdminData {
  id: number;
  nama: string;
  no_hp: string;
  roles: RoleData[]; // Array of roles (new backend format)
  role: string; // Primary role name for backward compatibility
  role_id: number | null; // Primary role ID for backward compatibility
  created_at?: string;
  updated_at?: string;
}

// Create admin input interface - supports multiple role IDs
export interface CreateAdminData {
  nama: string;
  no_hp: string;
  role_ids: number[]; // Changed to array for multiple roles
  password: string;
}

// Update admin input interface - supports multiple role IDs
export interface UpdateAdminData {
  nama?: string;
  no_hp?: string;
  role_ids?: number[]; // Changed to array for multiple roles
  password?: string;
}

interface AdminState {
  admins: AdminData[];
  loading: boolean;
  error: string | null;
}

type AdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADMINS'; payload: AdminData[] }
  | { type: 'ADD_ADMIN'; payload: AdminData }
  | { type: 'UPDATE_ADMIN'; payload: AdminData }
  | { type: 'DELETE_ADMIN'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null };

interface AdminContextType {
  state: AdminState;
  fetchAdmins: () => Promise<void>;
  createAdmin: (adminData: CreateAdminData) => Promise<AdminData>;
  updateAdmin: (id: number, adminData: UpdateAdminData) => Promise<AdminData>;
  deleteAdmin: (id: number) => Promise<void>;
  getAdminById: (id: number) => Promise<AdminData>;
}

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ADMINS':
      return { ...state, admins: action.payload, error: null };
    case 'ADD_ADMIN':
      return { ...state, admins: [...state.admins, action.payload] };
    case 'UPDATE_ADMIN':
      return {
        ...state,
        admins: state.admins.map(admin =>
          admin.id === action.payload.id ? action.payload : admin
        ),
      };
    case 'DELETE_ADMIN':
      return {
        ...state,
        admins: state.admins.filter(admin => admin.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const fetchAdmins = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('[AdminContext] Fetching admins...');

      const response = await fetchWithAuth('/api/admins', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AdminContext] Fetch result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch admins');
      }

      dispatch({ type: 'SET_ADMINS', payload: result.data || [] });
    } catch (error) {
      console.error('[AdminContext] Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admins';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createAdmin = useCallback(async (adminData: CreateAdminData): Promise<AdminData> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('[AdminContext] Creating admin:', adminData);

      const response = await fetchWithAuth('/api/admins', {
        method: 'POST',
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AdminContext] Create result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create admin');
      }

      const newAdmin = result.data;
      dispatch({ type: 'ADD_ADMIN', payload: newAdmin });
      return newAdmin;
    } catch (error) {
      console.error('[AdminContext] Create error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateAdmin = useCallback(async (id: number, adminData: UpdateAdminData): Promise<AdminData> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('[AdminContext] Updating admin:', id, adminData);

      // Optimistic update
      const existingAdmin = state.admins.find(a => a.id === id);
      if (existingAdmin) {
        const optimisticAdmin = { ...existingAdmin, ...adminData };
        dispatch({ type: 'UPDATE_ADMIN', payload: optimisticAdmin });
      }

      const response = await fetchWithAuth(`/api/admins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        if (existingAdmin) {
          dispatch({ type: 'UPDATE_ADMIN', payload: existingAdmin });
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AdminContext] Update result:', result);

      if (!result.success) {
        // Revert optimistic update on error
        if (existingAdmin) {
          dispatch({ type: 'UPDATE_ADMIN', payload: existingAdmin });
        }
        throw new Error(result.message || 'Failed to update admin');
      }

      const updatedAdmin = result.data;
      dispatch({ type: 'UPDATE_ADMIN', payload: updatedAdmin });
      return updatedAdmin;
    } catch (error) {
      console.error('[AdminContext] Update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.admins]);

  const deleteAdmin = useCallback(async (id: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('[AdminContext] Deleting admin:', id);

      // Optimistic update
      const adminToDelete = state.admins.find(a => a.id === id);
      dispatch({ type: 'DELETE_ADMIN', payload: id });

      const response = await fetchWithAuth(`/api/admins/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        if (adminToDelete) {
          dispatch({ type: 'ADD_ADMIN', payload: adminToDelete });
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AdminContext] Delete result:', result);

      if (!result.success) {
        // Revert optimistic update on error
        if (adminToDelete) {
          dispatch({ type: 'ADD_ADMIN', payload: adminToDelete });
        }
        throw new Error(result.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('[AdminContext] Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.admins]);

  const getAdminById = useCallback(async (id: number): Promise<AdminData> => {
    try {
      console.log('[AdminContext] Getting admin by ID:', id);

      const response = await fetchWithAuth(`/api/admins/${id}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[AdminContext] Get by ID result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to get admin');
      }

      return result.data;
    } catch (error) {
      console.error('[AdminContext] Get by ID error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get admin';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        state,
        fetchAdmins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        getAdminById,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}