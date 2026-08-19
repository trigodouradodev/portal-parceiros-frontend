import type { FieldErrors, FieldValues } from "react-hook-form";
import { fieldElementId } from "@/components/ui/field-hint";

export function firstErrorPath(
  errors: FieldErrors<FieldValues>,
  prefix = "",
): string | undefined {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if ("message" in value && value.message) return path;
    const nested = firstErrorPath(value as FieldErrors<FieldValues>, path);
    if (nested) return nested;
  }
  return undefined;
}

export function scrollToField(name: string) {
  requestAnimationFrame(() => {
    const element = document.getElementById(fieldElementId(name) ?? "");
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element
      .querySelector<HTMLElement>("input, textarea, select, button")
      ?.focus({ preventScroll: true });
  });
}

export function scrollToFirstError(errors: FieldErrors<FieldValues>) {
  const name = firstErrorPath(errors);
  if (name) scrollToField(name);
}
