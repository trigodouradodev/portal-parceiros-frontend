import { api } from "@/lib/api/axios";
import type {
  CreateSimulationPayload,
  SimulationSnapshot,
  UpdateSimulationPayload,
} from "./origination.types";

export const originationKeys = {
  all: ["origination"] as const,
  simulations: () => [...originationKeys.all, "simulations"] as const,
};

export const originationService = {
  /** GET /simulations */
  async listSimulations(): Promise<SimulationSnapshot[]> {
    const { data } = await api.get<SimulationSnapshot[]>("/simulations");
    return data;
  },

  /** POST /simulations */
  async createSimulation(
    payload: CreateSimulationPayload,
  ): Promise<SimulationSnapshot> {
    const { data } = await api.post<SimulationSnapshot>(
      "/simulations",
      payload,
    );
    return data;
  },

  /** PATCH /simulations/:id */
  async updateSimulation(
    id: string,
    payload: UpdateSimulationPayload,
  ): Promise<SimulationSnapshot> {
    const { data } = await api.patch<SimulationSnapshot>(
      `/simulations/${id}`,
      payload,
    );
    return data;
  },
};
