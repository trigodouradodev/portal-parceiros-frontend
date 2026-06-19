import type { ReactNode } from "react";

interface RegisterFormCardProps {
  children: ReactNode;
}

export function RegisterFormCard({ children }: RegisterFormCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
      {children}
    </div>
  );
}
