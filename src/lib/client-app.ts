/** URL base do Portal do Cliente, de acordo com o ambiente atual. */
export function getClientAppUrl(): string {
  const clientAppUrl = import.meta.env.VITE_CLIENT_APP_URL;

  if (!clientAppUrl) {
    throw new Error(
      "A variável de ambiente VITE_CLIENT_APP_URL é obrigatória para linkar o Portal do Cliente.",
    );
  }

  return clientAppUrl;
}
