const DEFAULT_MAX_AGE_DAYS = 365;

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

export function setCookie(
  name: string,
  value: string,
  maxAgeDays = DEFAULT_MAX_AGE_DAYS,
): void {
  if (typeof document === "undefined") {
    return;
  }

  const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
