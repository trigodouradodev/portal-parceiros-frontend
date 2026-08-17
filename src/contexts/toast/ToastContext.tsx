import { useCallback, useState, type ReactNode } from "react";
import { Toast } from "@/components/ui/toast";
import {
  ToastContext,
  type ToastOptions,
  type ToastVariant,
} from "@/contexts/toast/toast-context";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION = 5000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = Date.now() + Math.random();
      const variant = options?.variant ?? "info";
      const duration = options?.duration ?? DEFAULT_DURATION;

      setToasts((prev) => [...prev, { id, message, variant }]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-40 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full min-w-0">
            <Toast variant={toast.variant}>{toast.message}</Toast>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
