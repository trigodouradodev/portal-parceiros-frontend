import { createContext, useContext } from 'react';

export type ToastVariant = 'destructive' | 'info';

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
