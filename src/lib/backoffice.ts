/** Monta uma URL do Backoffice a partir da base configurada no ambiente. */
export function getBackofficeUrl(
  path:
    | "/quotes"
    | "/quotes/create/register"
    | `/credit-analysis/quotes/${string}`,
) {
  const backofficeBaseUrl = import.meta.env.VITE_BACKOFFICE_URL;

  if (!backofficeBaseUrl) {
    throw new Error(
      "A variável de ambiente VITE_BACKOFFICE_URL é obrigatória para acessar o Backoffice.",
    );
  }

  return new URL(path, backofficeBaseUrl).toString();
}

export function getBackofficeQuoteUrl(quoteId: string): string {
  return getBackofficeUrl(
    `/credit-analysis/quotes/${encodeURIComponent(quoteId)}`,
  );
}
