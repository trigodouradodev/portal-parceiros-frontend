import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "destructive" | "info";
  onClose?: () => void;
}

const variantStyles = {
  destructive:
    "bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))]",
  info: "bg-[hsl(var(--accent))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
};

const AlertIcon = ({ variant }: { variant: "destructive" | "info" }) => {
  if (variant === "destructive") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className = "", variant = "destructive", onClose, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${variantStyles[variant]} ${className}`}
        {...props}
      >
        <AlertIcon variant={variant} />
        <div className="flex-1 leading-relaxed">{children}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { Alert };
