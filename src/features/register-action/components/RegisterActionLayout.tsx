import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import type { ActionClient } from "@/contexts/action/action-context";
import { RegisterClientCard } from "./RegisterClientCard";

interface RegisterActionLayoutProps {
  title: string;
  client: ActionClient;
  onBack: () => void;
  children: ReactNode;
  beforeContent?: ReactNode;
  footer?: ReactNode;
}

export function RegisterActionLayout({
  title,
  client,
  onBack,
  beforeContent,
  children,
  footer,
}: RegisterActionLayoutProps) {
  return (
    <div className="min-h-screen flex-1 bg-background font-sans">
      <div className="bg-brand-yellow px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <h1 className="font-fraunces text-2xl font-bold text-brand-navy md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-brand-navy/60">
            {client.name} · {client.parcela}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        <RegisterClientCard client={client} />
        {beforeContent}
        {children}
        {footer}
      </div>
    </div>
  );
}
