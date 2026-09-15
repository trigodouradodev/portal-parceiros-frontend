import { QuoteStatus } from "./quotes.enums";

export type QuoteStatusTone =
  | "muted"
  | "warning"
  | "info"
  | "success"
  | "destructive";

export type QuoteListAction =
  | "continue_draft"
  | "follow_client_review"
  | "open_backoffice";

const QUOTE_STATUS_PRESENTATION: Record<
  string,
  { label: string; tone: QuoteStatusTone }
> = {
  [QuoteStatus.DRAFT]: { label: "Rascunho", tone: "muted" },
  [QuoteStatus.CLIENT_REVIEW]: {
    label: "Revisão do cliente",
    tone: "warning",
  },
  [QuoteStatus.KYC_ANALYSIS]: {
    label: "Validação automática",
    tone: "muted",
  },
  pending: { label: "Pendente de análise", tone: "warning" },
  em_analise: { label: "Em análise", tone: "info" },
  pending_correction: { label: "Pendente com o parceiro", tone: "warning" },
  pre_approved: { label: "Processando aprovação", tone: "muted" },
  approved: { label: "Aprovada", tone: "success" },
  auto_rejected: {
    label: "Reprovada automaticamente",
    tone: "destructive",
  },
  rejected: { label: "Rejeitada", tone: "destructive" },
  failed: { label: "Falhou", tone: "destructive" },
};

export function getQuoteStatusPresentation(status: string): {
  label: string;
  tone: QuoteStatusTone;
} {
  return QUOTE_STATUS_PRESENTATION[status] ?? { label: status, tone: "muted" };
}

export function isQuoteDraft(status: string): boolean {
  return status === QuoteStatus.DRAFT;
}

export function isQuoteClientReview(status: string): boolean {
  return status === QuoteStatus.CLIENT_REVIEW;
}

/** Já saiu da revisão do cliente — o parceiro vê a proposta no backoffice. */
export function isQuoteInBackoffice(status: string): boolean {
  return !isQuoteDraft(status) && !isQuoteClientReview(status);
}

export function getQuoteListAction(status: string): QuoteListAction {
  if (isQuoteDraft(status)) return "continue_draft";
  if (isQuoteClientReview(status)) return "follow_client_review";
  return "open_backoffice";
}
