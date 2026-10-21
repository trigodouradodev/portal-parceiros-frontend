import { isAxiosError } from "axios";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) {
    return fallback;
  }

  const message = (err.response?.data as { message?: string | string[] })
    ?.message;

  if (!message) {
    return fallback;
  }

  return Array.isArray(message) ? message.join(", ") : String(message);
}

/** `code` estável do corpo de erro da API, quando houver. */
export function getApiErrorCode(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const code = (err.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}
