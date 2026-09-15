import { isQuoteStatus, QuoteStatus } from "./quotes.enums";

export type QuoteStatusTone =
  | "muted"
  | "warning"
  | "info"
  | "success"
  | "destructive";

export const QuoteListAction = {
  CONTINUE_DRAFT: "continue_draft",
  FOLLOW_CLIENT_REVIEW: "follow_client_review",
  OPEN_BACKOFFICE: "open_backoffice",
} as const;

export type QuoteListAction =
  (typeof QuoteListAction)[keyof typeof QuoteListAction];

const QUOTE_STATUS_PRESENTATION: Record<
  QuoteStatus,
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
  [QuoteStatus.PENDING]: { label: "Pendente de análise", tone: "warning" },
  [QuoteStatus.IN_ANALYSIS]: { label: "Em análise", tone: "info" },
  [QuoteStatus.PENDING_CORRECTION]: {
    label: "Pendente com o parceiro",
    tone: "warning",
  },
  [QuoteStatus.PRE_APPROVED]: {
    label: "Processando aprovação",
    tone: "muted",
  },
  [QuoteStatus.APPROVED]: { label: "Aprovada", tone: "success" },
  [QuoteStatus.AUTO_REJECTED]: {
    label: "Reprovada automaticamente",
    tone: "destructive",
  },
  [QuoteStatus.REJECTED]: { label: "Rejeitada", tone: "destructive" },
  [QuoteStatus.FAILED]: { label: "Falhou", tone: "destructive" },
};

export function getQuoteStatusPresentation(status: string): {
  label: string;
  tone: QuoteStatusTone;
} {
  if (isQuoteStatus(status)) return QUOTE_STATUS_PRESENTATION[status];
  return { label: status, tone: "muted" };
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
  if (isQuoteDraft(status)) return QuoteListAction.CONTINUE_DRAFT;
  if (isQuoteClientReview(status)) return QuoteListAction.FOLLOW_CLIENT_REVIEW;
  return QuoteListAction.OPEN_BACKOFFICE;
}

export function opensQuoteInBackoffice(action: QuoteListAction): boolean {
  return (
    action === QuoteListAction.OPEN_BACKOFFICE ||
    action === QuoteListAction.FOLLOW_CLIENT_REVIEW
  );
}
