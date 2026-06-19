const BRAZIL_COUNTRY_CODE = "55";
const MIN_LOCAL_DIGITS = 10;
const MAX_LOCAL_DIGITS = 11;

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Normalizes a phone string to digits with Brazilian country code, or null if invalid.
 */
export function normalizePhoneDigits(phone: string): string | null {
  const digits = digitsOnly(phone);
  if (!digits) return null;

  if (digits.startsWith(BRAZIL_COUNTRY_CODE)) {
    const local = digits.slice(BRAZIL_COUNTRY_CODE.length);
    if (local.length >= MIN_LOCAL_DIGITS && local.length <= MAX_LOCAL_DIGITS) {
      return digits;
    }
    return null;
  }

  if (digits.length >= MIN_LOCAL_DIGITS && digits.length <= MAX_LOCAL_DIGITS) {
    return `${BRAZIL_COUNTRY_CODE}${digits}`;
  }

  return null;
}

export function hasCallablePhone(phone?: string | null): boolean {
  if (!phone) return false;
  return normalizePhoneDigits(phone) !== null;
}

export function toTelUrl(phone: string): string {
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) {
    throw new Error("Invalid phone number");
  }
  return `tel:+${normalized}`;
}

export function toWhatsAppUrl(phone: string, message?: string): string {
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) {
    throw new Error("Invalid phone number");
  }

  const base = `https://wa.me/${normalized}`;
  if (!message) return base;

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function openPhoneCall(phone: string): void {
  window.location.href = toTelUrl(phone);
}

export function openWhatsApp(phone: string, message?: string): void {
  window.open(toWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
}
