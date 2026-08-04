import {
  buildSegmentCountsFromApi,
  extractTodayQueueMeta,
  flattenTodayQueueCards,
} from "@/hooks/useActivities";
import { normalizeQueueSegmentCode } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import { mapQueueTaskCardToOverdueItem } from "@/features/dashboard/mappers/map-queue-task-card-to-overdue";
import {
  ActivityTaskStatus,
  ActivityTaskType,
  QueueSegmentCode,
  QueueTone,
} from "@/services/activities/activity.enums";
import type { QueueTaskCard } from "@/services/activities/activities.types";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

function makeCard(
  overrides: Partial<QueueTaskCard> & { taskId: string },
): QueueTaskCard {
  const { taskId, ...rest } = overrides;
  return {
    position: 1,
    taskId,
    segmentCode: QueueSegmentCode.MID,
    priority: 1,
    tone: QueueTone.FRIENDLY,
    taskType: ActivityTaskType.CONTACT,
    status: ActivityTaskStatus.PENDING,
    isActive: false,
    assignedTo: null,
    expireDate: "2026-03-01",
    wasPostponed: false,
    wasRescheduled: false,
    client: { name: "Cliente", taxId: "12345678901", phone: "11999999999" },
    contract: {
      id: "c1",
      number: "C-1",
      totalInstallments: 12,
    },
    installment: {
      id: "i1",
      number: 2,
      label: "Parcela 2",
      dueDate: "2026-02-01",
      daysOverdue: 10,
      pendingAmount: 500,
      totalAmount: 500,
      amountOverdue: 500,
    },
    ...rest,
  };
}

describe("normalizeQueueSegmentCode", () => {
  it("aliases API codes and falls back to mid", () => {
    expect(normalizeQueueSegmentCode("post_letter")).toBe("late");
    expect(normalizeQueueSegmentCode("pre_default")).toBe("critical");
    expect(normalizeQueueSegmentCode("early")).toBe("early");
    expect(normalizeQueueSegmentCode("unknown")).toBe("mid");
  });
});

describe("mapQueueTaskCardToOverdueItem", () => {
  it("maps card fields into overdue item shape", () => {
    const item = mapQueueTaskCardToOverdueItem(
      makeCard({
        taskId: "t-1",
        segmentCode: QueueSegmentCode.POST_LETTER,
        tone: QueueTone.FIRM,
        taskType: ActivityTaskType.VISIT,
        isActive: true,
      }),
    );

    expect(item.task?.id).toBe("t-1");
    expect(item.task?.channel).toBe(ActivityChannel.CLIENT_VISIT);
    expect(item.task?.stageCode).toBe("assertive");
    expect(item.queueSegmentCode).toBe("late");
    expect(item.apiSegmentCode).toBe(QueueSegmentCode.POST_LETTER);
    expect(item.isActive).toBe(true);
  });
});

describe("flattenTodayQueueCards", () => {
  it("puts active first and dedupes from locked", () => {
    const active = makeCard({ taskId: "active", isActive: true });
    const lockedA = makeCard({ taskId: "active" });
    const lockedB = makeCard({ taskId: "locked-2" });

    expect(
      flattenTodayQueueCards([
        { active, locked: { items: [lockedA, lockedB] } },
      ]).map((c) => c.taskId),
    ).toEqual(["active", "locked-2"]);
  });

  it("returns only locked when there is no active", () => {
    expect(
      flattenTodayQueueCards([
        {
          active: null,
          locked: { items: [makeCard({ taskId: "only" })] },
        },
      ]).map((c) => c.taskId),
    ).toEqual(["only"]);
  });
});

describe("extractTodayQueueMeta / buildSegmentCountsFromApi", () => {
  it("reads scheduled and completed from first page", () => {
    const scheduled = [makeCard({ taskId: "s1" })];
    const completedToday = [makeCard({ taskId: "c1" })];

    expect(
      extractTodayQueueMeta([
        {
          active: null,
          counter: 1,
          segments: [],
          locked: {
            items: [],
            pagination: {
              page: 1,
              limit: 30,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
            },
          },
          scheduled,
          completedToday,
        },
      ]),
    ).toEqual({ scheduled, completedToday });
  });

  it("aggregates segment counts with aliases", () => {
    expect(
      buildSegmentCountsFromApi([
        { code: QueueSegmentCode.POST_LETTER, priority: 1, count: 2 },
        { code: QueueSegmentCode.EARLY, priority: 2, count: 3 },
        { code: QueueSegmentCode.POST_LETTER, priority: 1, count: 1 },
      ]),
    ).toEqual({
      late: 3,
      early: 3,
    });
  });
});
