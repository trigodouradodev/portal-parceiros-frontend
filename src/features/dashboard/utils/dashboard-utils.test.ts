import { getPendingActionLabel } from "@/features/dashboard/utils/pending-action-label";
import {
  getReguaBadge,
  getReguaBadgeWhenNoTask,
} from "@/features/dashboard/utils/collection-stage";
import { buildCompletedHighlightNavigationState } from "@/features/dashboard/utils/queue-highlight-navigation";
import {
  formatPreventiveDaysInfo,
  mapFollowupStatusToStage,
} from "@/features/dashboard/utils/task-mappers";
import {
  getChargeRegisterPath,
  getPreventiveRegisterPath,
  hasPendingChargeTask,
} from "@/features/dashboard/utils/launch-action";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

describe("getPendingActionLabel", () => {
  it("labels visit vs contact", () => {
    expect(getPendingActionLabel(ActivityChannel.CLIENT_VISIT)).toBe(
      "Visita pendente",
    );
    expect(getPendingActionLabel(ActivityChannel.CLIENT_CALL)).toBe(
      "Contato pendente",
    );
    expect(getPendingActionLabel()).toBe("Contato pendente");
  });
});

describe("getReguaBadge / getReguaBadgeWhenNoTask", () => {
  it("uses stage badge label override", () => {
    expect(getReguaBadge("friendly", "Custom")).toEqual({
      label: "Custom",
      color: "blue",
    });
    expect(getReguaBadge()).toBeUndefined();
  });

  it("derives badge from days overdue when there is no task", () => {
    expect(getReguaBadgeWhenNoTask(3).label).toBe("Amigável");
    expect(getReguaBadgeWhenNoTask(7).label).toBe("Assertivo");
    expect(getReguaBadgeWhenNoTask(12).label).toBe("Advertência");
    expect(getReguaBadgeWhenNoTask(25).label).toBe("Aviso de Inadimplência");
  });
});

describe("buildCompletedHighlightNavigationState", () => {
  it("returns state only with installment id", () => {
    expect(buildCompletedHighlightNavigationState(undefined)).toBeUndefined();
    expect(buildCompletedHighlightNavigationState("inst-1")).toEqual({
      highlightCompletedInstallmentId: "inst-1",
    });
  });
});

describe("formatPreventiveDaysInfo", () => {
  it("formats near due dates", () => {
    expect(formatPreventiveDaysInfo(0)).toBe("Vence hoje");
    expect(formatPreventiveDaysInfo(1)).toBe("Vence amanhã");
    expect(formatPreventiveDaysInfo(2)).toBe("Vence em 2 dias");
    expect(formatPreventiveDaysInfo(4)).toBe("Vence em 5 dias");
    expect(formatPreventiveDaysInfo(10)).toBe("Vence em 10 dias");
  });
});

describe("mapFollowupStatusToStage", () => {
  it("maps promise, no answer and paid statuses", () => {
    expect(mapFollowupStatusToStage("promise_to_pay")).toBe("promise");
    expect(mapFollowupStatusToStage("promise_to_pay", 2)).toBe("fup");
    expect(mapFollowupStatusToStage("no_answer", 0)).toBe("initial");
    expect(mapFollowupStatusToStage("no_answer", 1)).toBe("second_attempt");
    expect(mapFollowupStatusToStage("no_answer", 2)).toBe("third_attempt");
    expect(mapFollowupStatusToStage("contacted")).toBe("paid");
    expect(mapFollowupStatusToStage(undefined)).toBe("initial");
  });
});

describe("launch-action helpers", () => {
  it("exposes register paths and pending task check", () => {
    expect(getChargeRegisterPath()).toBe("/register/charge");
    expect(getPreventiveRegisterPath()).toBe("/register/preventive");

    const pending = {
      task: { status: ActivityTaskStatus.PENDING },
    } as OverdueCollectionItem;
    const done = {
      task: { status: ActivityTaskStatus.COMPLETED },
    } as OverdueCollectionItem;

    expect(hasPendingChargeTask(pending)).toBe(true);
    expect(hasPendingChargeTask(done)).toBe(false);
  });
});
