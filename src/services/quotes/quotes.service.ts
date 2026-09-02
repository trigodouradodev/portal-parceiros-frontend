import { api } from "@/lib/api/axios";
import type {
  CreateDraftQuotePayload,
  QuoteDraftSnapshot,
  QuoteRegistrationSnapshot,
  SaveQuoteRegistrationPayload,
} from "./quotes.types";

export const quotesKeys = {
  all: ["quotes"] as const,
  draftsRoot: () => [...quotesKeys.all, "drafts"] as const,
};

export const quotesService = {
  /** POST /quotes/draft */
  async createDraft(
    payload: CreateDraftQuotePayload,
  ): Promise<QuoteDraftSnapshot> {
    const { data } = await api.post<QuoteDraftSnapshot>(
      "/quotes/draft",
      payload,
    );
    return data;
  },

  /** PATCH /quotes/draft/:quoteId/registration */
  async saveDraftRegistration(
    quoteId: string,
    payload: SaveQuoteRegistrationPayload,
  ): Promise<QuoteRegistrationSnapshot> {
    const { data } = await api.patch<QuoteRegistrationSnapshot>(
      `/quotes/draft/${quoteId}/registration`,
      payload,
    );
    return data;
  },
};
