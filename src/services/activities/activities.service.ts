import api from "@/lib/api/axios";
import type {
  RegisterInteractionPayload,
  RegisterInteractionResponse,
} from "./activities.types";

export const activitiesService = {
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
};
