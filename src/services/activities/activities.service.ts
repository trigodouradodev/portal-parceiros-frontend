import api from "@/lib/api/axios";
import {
  normalizeInstallmentDetail,
  normalizeTodayQueue,
} from "./normalize-api-responses";
import type {
  RegisterInteractionPayload,
  RegisterInteractionResponse,
  RescheduleTaskPayload,
  TaskActionResult,
  ActivitySubordinate,
  TodayQueue,
} from "./activities.types";
import type { InstallmentDetail } from "./installment-detail.types";

export const activitiesService = {
  async getSubordinates(): Promise<ActivitySubordinate[]> {
    const { data } = await api.get<ActivitySubordinate[]>(
      "/activities/subordinates",
    );
    return data;
  },

  async getTodayQueue(
    page = 1,
    limit = 30,
    assignedToId?: string,
  ): Promise<TodayQueue> {
    const { data } = await api.get<TodayQueue>("/activities/tasks/today", {
      params: { page, limit, ...(assignedToId ? { assignedToId } : {}) },
    });
    return normalizeTodayQueue(data);
  },

  async getInstallmentDetail(
    installmentId: string,
  ): Promise<InstallmentDetail> {
    const { data } = await api.get<InstallmentDetail>(
      `/activities/installments/${installmentId}`,
    );
    return normalizeInstallmentDetail(data);
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
