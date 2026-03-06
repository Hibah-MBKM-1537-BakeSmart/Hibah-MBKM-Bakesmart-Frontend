'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type AlertVariant = 'default' | 'destructive';

interface AlertState {
  open: boolean;
  title: string;
  description?: string;
  variant?: AlertVariant;
  resolve?: (value: boolean) => void;
  showCancel?: boolean;
}

interface AlertContextType {
  alert: (title: string, description?: string) => Promise<void>;
  success: (title: string, description?: string) => Promise<void>;
  error: (title: string, description?: string) => Promise<void>;
  confirm: (title: string, description?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    open: false,
    title: '',
  });

  const close = () => {
    setState(prev => ({ ...prev, open: false }));
  };

  const show = (
    title: string,
    description?: string,
    options?: Partial<AlertState>
  ) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title,
        description,
        resolve,
        ...options,
      });
    });
  };

  const alert = async (title: string, description?: string) => {
    await show(title, description, { showCancel: false });
  };

  const success = async (title: string, description?: string) => {
    await show(title, description, { showCancel: false });
  };

  const error = async (title: string, description?: string) => {
    await show(title, description, {
      variant: 'destructive',
      showCancel: false,
    });
  };

  const confirm = async (title: string, description?: string) => {
    return await show(title, description, {
      showCancel: true,
    });
  };

  return (
    <AlertContext.Provider value={{ alert, success, error, confirm }}>
      {children}

      <AlertDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) {
            state.resolve?.(false);
            close();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {state.title}
            </AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription>
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            {state.showCancel && (
              <AlertDialogCancel
                onClick={() => {
                  state.resolve?.(false);
                  close();
                }}
              >
                Cancel
              </AlertDialogCancel>
            )}

            <AlertDialogAction
              className={
                state.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
              onClick={() => {
                state.resolve?.(true);
                close();
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used inside AppAlertProvider');
  }
  return context;
}