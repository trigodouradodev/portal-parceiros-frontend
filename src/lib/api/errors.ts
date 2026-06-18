import { isAxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback: string,
): string {
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
