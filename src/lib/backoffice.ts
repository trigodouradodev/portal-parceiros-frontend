/** Monta uma URL do Backoffice a partir da base configurada no ambiente. */
export function getBackofficeUrl(path: "/quotes" | "/quotes/create/register") {
  const backofficeBaseUrl = import.meta.env.VITE_BACKOFFICE_URL;

  if (!backofficeBaseUrl) {
    throw new Error(
      "A variável de ambiente VITE_BACKOFFICE_URL é obrigatória para acessar o Backoffice.",
    );
  }

  return new URL(path, backofficeBaseUrl).toString();
}
