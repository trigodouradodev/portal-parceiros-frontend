import { Alert, type AlertProps } from "@/components/ui/Alert";

export type ToastProps = AlertProps;

const Toast = ({ className = "", ...props }: ToastProps) => {
  return (
    <Alert
      {...props}
      className={`shadow-[var(--shadow-elevated)] backdrop-blur-sm animate-toast-in ${className}`}
    />
  );
};
Toast.displayName = "Toast";

export { Toast };
