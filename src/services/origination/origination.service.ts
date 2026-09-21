import { api } from "@/lib/api/axios";
import type {
  ListSimulationsQuery,
  SimulatePayload,
  SimulateResult,
  SimulationSnapshot,
} from "./origination.types";

export const originationKeys = {
  all: ["origination"] as const,
  simulationsRoot: () => [...originationKeys.all, "simulations"] as const,
  simulations: (query: ListSimulationsQuery = {}) =>
    [...originationKeys.simulationsRoot(), query] as const,
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

  /** POST /simulations/simulate — elegibilidade, cálculo e persistência. */
  async simulate(payload: SimulatePayload): Promise<SimulateResult> {
    const { data } = await api.post<SimulateResult>(
      "/simulations/simulate",
      payload,
    );
    return data;
  },
};
