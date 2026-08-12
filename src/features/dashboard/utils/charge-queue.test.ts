import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import {
  buildChargeQueue,
  isChargeQueueItemBlocked,
  isQueueItemActionable,
  resolveQueueSegment,
} from "@/features/dashboard/utils/charge-queue";

function makeItem(
  overrides: Partial<OverdueCollectionItem> & {
    daysOverdue?: number;
    installmentNumber?: number;
    taskStatus?: ActivityTaskStatus | null;
    followupStatus?: string;
    taskId?: string;
  } = {},
): OverdueCollectionItem {
  const {
    daysOverdue = 3,
    installmentNumber = 2,
    taskStatus = ActivityTaskStatus.PENDING,
    followupStatus,
    taskId = "task-1",
    ...rest
  } = overrides;

  return {
    installment: {
      id: "inst-1",
      number: installmentNumber,
      label: "Parcela 2",
      dueDate: "2026-01-01",
      daysOverdue,
      pendingAmount: 100,
      totalAmount: 100,
      status: "not_paid",
    },
    contract: {
      id: "c-1",
      number: "C-1",
      totalInstallments: 12,
    },
    client: {
      name: "Cliente",
      taxId: "12345678901",
    },
    task:
      taskStatus === null
        ? null
        : {
            id: taskId,
            stageCode: "friendly",
            stageBadgeLabel: "Amigável",
            channel: "whatsapp_message",
            status: taskStatus,
          },
    followup: followupStatus
      ? { count: 1, latestStatus: followupStatus }
      : undefined,
    ...rest,
  };
}

describe("resolveQueueSegment", () => {
  it("prefers explicit queueSegmentCode", () => {
    expect(
      resolveQueueSegment(makeItem({ queueSegmentCode: "critical" })),
    ).toBe("critical");
  });

  it("detects broken promise from followup status", () => {
    expect(
      resolveQueueSegment(makeItem({ followupStatus: "promise_to_pay" })),
    ).toBe("broken_promise");
  });

  it("classifies by installment number and days overdue", () => {
    expect(resolveQueueSegment(makeItem({ installmentNumber: 1 }))).toBe("fpd");
    expect(resolveQueueSegment(makeItem({ daysOverdue: 1 }))).toBe("recent");
    expect(resolveQueueSegment(makeItem({ daysOverdue: 4 }))).toBe("early");
    expect(resolveQueueSegment(makeItem({ daysOverdue: 10 }))).toBe("mid");
    expect(resolveQueueSegment(makeItem({ daysOverdue: 18 }))).toBe("late");
    expect(resolveQueueSegment(makeItem({ daysOverdue: 30 }))).toBe("critical");
  });
});

describe("buildChargeQueue", () => {
  it("groups, sorts by overdue desc and finds first actionable index", () => {
    const items = [
      makeItem({
        taskId: "done",
        taskStatus: ActivityTaskStatus.COMPLETED,
        daysOverdue: 20,
      }),
      makeItem({
        taskId: "pending-a",
        daysOverdue: 12,
      }),
      makeItem({
        taskId: "pending-b",
        daysOverdue: 25,
      }),
    ];

    const queue = buildChargeQueue(items);

    // mid → late → critical (CHARGE_QUEUE_SEGMENT_ORDER)
    expect(queue.flat.map((e) => e.item.task?.id)).toEqual([
      "pending-a",
      "done",
      "pending-b",
    ]);
    expect(queue.actionableIndex).toBe(0);
    expect(queue.groups.length).toBeGreaterThan(0);
  });
});

describe("isQueueItemActionable / isChargeQueueItemBlocked", () => {
  it("only the actionable pending item is unblocked", () => {
    const pending = makeItem({ taskId: "p1", daysOverdue: 4 });
    const other = makeItem({
      taskId: "p2",
      daysOverdue: 8,
    });
    const queue = buildChargeQueue([pending, other]);

    // AUREA-319: isQueueItemActionable agora recebe `unlocked` já resolvido
    // por entrada, não mais um índice pra comparar contra actionableIndex.
    // No fluxo legado, só a #1 da fila fica unlocked (inalterado).
    expect(isQueueItemActionable(queue.flat[0].unlocked, true)).toBe(true);
    expect(isQueueItemActionable(queue.flat[1].unlocked, true)).toBe(false);
    expect(isChargeQueueItemBlocked(queue, pending)).toBe(false);
    expect(isChargeQueueItemBlocked(queue, other)).toBe(true);
  });
});
