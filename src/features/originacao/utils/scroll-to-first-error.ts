import type { FieldErrors, FieldValues } from "react-hook-form";
import { fieldElementId } from "@/components/ui/field-hint";

export const ORIGINACAO_TASK_SCROLL_ID = "originacao-task-scroll";

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

export function nearestScrollableParent(element: HTMLElement): HTMLElement {
  const tagged = document.getElementById(ORIGINACAO_TASK_SCROLL_ID);
  if (tagged?.contains(element)) return tagged;

  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = getComputedStyle(parent);
    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return (document.scrollingElement ?? document.documentElement) as HTMLElement;
}

function scrollElementIntoContainer(element: HTMLElement) {
  const container = nearestScrollableParent(element);
  const padding = 16;
  const top =
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    padding;
  container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function scrollTaskToTop(behavior: ScrollBehavior = "auto") {
  document
    .getElementById(ORIGINACAO_TASK_SCROLL_ID)
    ?.scrollTo({ top: 0, behavior });
}

export function scrollToField(name: string) {
  const run = () => {
    const element = document.getElementById(fieldElementId(name) ?? "");
    if (!element) {
      scrollTaskToTop("smooth");
      return;
    }
    scrollElementIntoContainer(element);
    element
      .querySelector<HTMLElement>("input, textarea, select, button")
      ?.focus({ preventScroll: true });
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

export function scrollToFirstError(errors: FieldErrors<FieldValues>) {
  const name = firstErrorPath(errors);
  if (name) scrollToField(name);
}
