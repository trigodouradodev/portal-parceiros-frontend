import { MapPin, MessageSquare, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type {
  TimelineStep,
  TimelineTone,
} from "@/features/contract-detail/types";

export const TONE_META: Record<
  TimelineTone,
  { label: string; bg: string; text: string; button: string }
> = {
  friendly: {
    label: "Tom amigável",
    bg: "bg-success-bg",
    text: "text-success",
    button: "bg-success hover:bg-success/90",
  },
  firm: {
    label: "Tom firme",
    bg: "bg-warning-bg",
    text: "text-warning",
    button: "bg-[#BA7517] hover:bg-[#9a6012]",
  },
  severe: {
    label: "Tom severo",
    bg: "bg-destructive-bg",
    text: "text-destructive",
    button: "bg-destructive hover:bg-destructive/90",
  },
};

export function getStepIcon(label: string): ReactNode | null {
  const normalized = label.toLowerCase();
  if (normalized.includes("whatsapp") || normalized.includes("contato")) {
    return <MessageSquare size={12} />;
  }
  if (normalized.includes("liga")) {
    return <Phone size={12} />;
  }
  if (normalized.includes("visita")) {
    return <MapPin size={12} />;
  }
  return null;
}

export function getConnectorClassName(status: TimelineStep["status"]): string {
  if (status === "done") return "bg-success";
  if (status === "missed") return "bg-destructive";
  if (status === "current") return "bg-[#BA7517]";
  return "bg-border";
}

export function getLabelClassName(status: TimelineStep["status"]): string {
  if (status === "missed") return "text-destructive";
  if (status === "pending") return "text-muted-foreground";
  return "text-foreground";
}

export function getIconClassName(status: TimelineStep["status"]): string {
  if (status === "done") return "text-success";
  if (status === "missed") return "text-destructive";
  if (status === "current") return "text-[#BA7517]";
  return "text-muted-foreground/60";
}

export function getCtaClassName(tone?: TimelineTone): string {
  if (!tone) return "bg-[#BA7517] hover:bg-[#9a6012]";
  return TONE_META[tone].button;
}
