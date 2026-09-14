import { api } from "@/lib/api/axios";
import type {
  CreateSimulationPayload,
  ListSimulationsQuery,
  PreviewSimulationPayload,
  SimulationPreview,
  SimulationSnapshot,
  UpdateSimulationPayload,
} from "./origination.types";

export const originationKeys = {
  all: ["origination"] as const,
  simulationsRoot: () => [...originationKeys.all, "simulations"] as const,
  simulations: (query: ListSimulationsQuery = {}) =>
    [...originationKeys.simulationsRoot(), query] as const,
  preview: (payload: PreviewSimulationPayload) =>
    [...originationKeys.simulationsRoot(), "preview", payload] as const,
};

export const originationService = {
  /** GET /simulations */
  async listSimulations(
    query: ListSimulationsQuery = {},
  ): Promise<SimulationSnapshot[]> {
    const { data } = await api.get<SimulationSnapshot[]>("/simulations", {
      params: {
        ...(query.name ? { name: query.name } : {}),
        ...(query.document ? { document: query.document } : {}),
      },
    });
    return data;
  },

  /** POST /simulations/preview — parcela Celcoin sem persistir */
  async previewSimulation(
    payload: PreviewSimulationPayload,
  ): Promise<SimulationPreview> {
    const { data } = await api.post<SimulationPreview>(
      "/simulations/preview",
      payload,
    );
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
