import {
  buildChargeActionPayloadFromInstallmentDetail,
  getPendingTaskFromInstallmentDetail,
} from "./launch-action";
import type { InstallmentDetail } from "@/services/activities/installment-detail.types";
import {
  ActivityTaskStatus,
  ActivityTaskType,
} from "@/services/activities/activity.enums";

function detail(isCollectible = true): InstallmentDetail {
  return {
    installment: {
      id: "i6",
      number: 6,
      label: "6/12",
      dueDate: "2026-11-02",
      daysOverdue: 3,
      pendingAmount: 100,
      totalAmount: 100,
      status: "not_paid",
    },
    contract: {
      id: "contract-1",
      number: "123",
      totalInstallments: 12,
      totalAmount: 1200,
    },
    client: { name: "Maria", taxId: "12345678900", isDeceased: true },
    guarantor: {
      name: "José",
      taxId: "98765432100",
      phone: "11999999999",
      isDeceased: false,
    },
    responsible: null,
    tasks: [
      {
        id: "task-1",
        isCollectible,
        segmentCode: "early",
        priority: 3,
        tone: "friendly",
        taskType: ActivityTaskType.CONTACT,
        status: ActivityTaskStatus.PENDING,
        createdBy: "system",
        expireDate: "2026-11-05",
        wasPostponed: false,
        wasRescheduled: false,
        rescheduleCount: 0,
        createdAt: "2026-11-05T09:00:00Z",
        interaction: null,
      },
    ],
  };
}

it("não inicia registro para uma pendente que perdeu elegibilidade", () => {
  expect(getPendingTaskFromInstallmentDetail(detail(false))).toBeUndefined();
  expect(
    buildChargeActionPayloadFromInstallmentDetail(detail(false), vi.fn()),
  ).toBeNull();
});

it("leva os dados atuais de óbito para a seleção de destinatário", () => {
  const payload = buildChargeActionPayloadFromInstallmentDetail(
    detail(),
    vi.fn(),
  );
  expect(payload?.client.isDeceased).toBe(true);
  expect(payload?.guarantor).toMatchObject({ name: "José", isDeceased: false });
  expect(payload?.taskId).toBe("task-1");
});
