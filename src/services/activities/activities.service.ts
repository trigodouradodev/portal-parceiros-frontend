import api from "@/lib/api/axios";
import type {
  RegisterInteractionPayload,
  RegisterInteractionResponse,
  RescheduleTaskPayload,
  TaskActionResult,
  TodayQueue,
} from "./activities.types";
import type { InstallmentDetail } from "./installment-detail.types";

export const activitiesService = {
  async getTodayQueue(page = 1, limit = 30): Promise<TodayQueue> {
    const { data } = await api.get<TodayQueue>("/activities/tasks/today", {
      params: { page, limit },
    });
    return data;
  },

  async getInstallmentDetail(installmentId: string): Promise<InstallmentDetail> {
    const { data } = await api.get<InstallmentDetail>(
      `/activities/installments/${installmentId}`,
    );
    return data;
  },

  async registerInteraction(
    taskId: string,
    payload: RegisterInteractionPayload,
  ): Promise<RegisterInteractionResponse> {
    const { data } = await api.post<RegisterInteractionResponse>(
      `/activities/tasks/${taskId}/interactions`,
      payload,
    );
    return data;
  },

  async postponeTask(taskId: string): Promise<TaskActionResult> {
    const { data } = await api.post<TaskActionResult>(
      `/activities/tasks/${taskId}/postpone`,
    );
    return data;
  },

  async rescheduleTask(
    taskId: string,
    payload: RescheduleTaskPayload,
  ): Promise<TaskActionResult> {
    const { data } = await api.post<TaskActionResult>(
      `/activities/tasks/${taskId}/reschedule`,
      payload,
    );
    return data;
  },
};
