import { getCookie, setCookie } from "@/lib/cookies";

export const TaskTab = {
  Charge: "charge",
  Preventive: "preventive",
} as const;

export type TaskTab = (typeof TaskTab)[keyof typeof TaskTab];

export const TASK_TAB_COOKIE = "dashboard_task_tab";
export const DEFAULT_TASK_TAB = TaskTab.Charge;

const LEGACY_TAB_VALUES: Record<string, TaskTab> = {
  cobr: TaskTab.Charge,
  prev: TaskTab.Preventive,
};

export function parseTaskTab(value: string | null | undefined): TaskTab {
  if (value === TaskTab.Preventive) return TaskTab.Preventive;
  if (value === TaskTab.Charge) return TaskTab.Charge;
  if (value && value in LEGACY_TAB_VALUES) {
    return LEGACY_TAB_VALUES[value];
  }
  return DEFAULT_TASK_TAB;
}

export function readTaskTabFromCookie(): TaskTab {
  return parseTaskTab(getCookie(TASK_TAB_COOKIE));
}

export function writeTaskTabCookie(tab: TaskTab): void {
  setCookie(TASK_TAB_COOKIE, tab);
}

export function isTaskTab(value: string): value is TaskTab {
  return value === TaskTab.Charge || value === TaskTab.Preventive;
}
