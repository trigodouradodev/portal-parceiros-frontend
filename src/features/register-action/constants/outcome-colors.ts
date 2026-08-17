export type OutcomeColorKey =
  | "green"
  | "teal"
  | "amber"
  | "red"
  | "gray"
  | "blue";

export interface OutcomeColorClasses {
  bg: string;
  icon: string;
  border: string;
}

export const OUTCOME_COLOR_CLASSES: Record<
  OutcomeColorKey,
  OutcomeColorClasses
> = {
  green: {
    bg: "bg-success-bg",
    icon: "text-success",
    border: "border-success",
  },
  teal: {
    bg: "bg-brand-yellow/15",
    icon: "text-brand-navy",
    border: "border-brand-navy",
  },
  amber: {
    bg: "bg-warning-bg",
    icon: "text-warning",
    border: "border-warning",
  },
  red: {
    bg: "bg-destructive-bg",
    icon: "text-destructive",
    border: "border-destructive",
  },
  gray: {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    border: "border-muted-foreground",
  },
  blue: {
    bg: "bg-brand-yellow/15",
    icon: "text-brand-navy",
    border: "border-brand-navy",
  },
};
