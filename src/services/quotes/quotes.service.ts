import { api } from "@/lib/api/axios";
import type {
  CreateDraftQuotePayload,
  QuoteAddressSnapshot,
  QuoteDraftSnapshot,
  QuoteFinancialSnapshot,
  QuoteGuarantorSnapshot,
  QuoteIncomeSnapshot,
  QuotePartnerOpinionSnapshot,
  QuoteRegistrationSnapshot,
  QuoteStatusResponse,
  SaveQuoteAddressPayload,
  SaveQuoteFinancialPayload,
  SaveQuoteGuarantorPayload,
  SaveQuoteIncomePayload,
  SaveQuotePartnerOpinionPayload,
  SaveQuoteRegistrationPayload,
} from "./quotes.types";

export const quotesKeys = {
  all: ["quotes"] as const,
  draftsRoot: () => [...quotesKeys.all, "drafts"] as const,
  draft: (quoteId: string) => [...quotesKeys.all, "draft", quoteId] as const,
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

  /** PATCH /quotes/draft/:quoteId/income */
  async saveIncome(
    quoteId: string,
    payload: SaveQuoteIncomePayload,
  ): Promise<QuoteIncomeSnapshot> {
    const { data } = await api.patch<QuoteIncomeSnapshot>(
      `/quotes/draft/${quoteId}/income`,
      payload,
    );
    return data;
  },

  /** PATCH /quotes/draft/:quoteId/address */
  async saveAddress(
    quoteId: string,
    payload: SaveQuoteAddressPayload,
  ): Promise<QuoteAddressSnapshot> {
    const { data } = await api.patch<QuoteAddressSnapshot>(
      `/quotes/draft/${quoteId}/address`,
      payload,
    );
    return data;
  },

  /** PATCH /quotes/draft/:quoteId/partner-opinion */
  async savePartnerOpinion(
    quoteId: string,
    payload: SaveQuotePartnerOpinionPayload,
  ): Promise<QuotePartnerOpinionSnapshot> {
    const { data } = await api.patch<QuotePartnerOpinionSnapshot>(
      `/quotes/draft/${quoteId}/partner-opinion`,
      payload,
    );
    return data;
  },

  /** PATCH /quotes/draft/:quoteId/guarantor */
  async saveGuarantor(
    quoteId: string,
    payload: SaveQuoteGuarantorPayload,
  ): Promise<QuoteGuarantorSnapshot> {
    const { data } = await api.patch<QuoteGuarantorSnapshot>(
      `/quotes/draft/${quoteId}/guarantor`,
      payload,
    );
    return data;
  },

  /** PATCH /quotes/draft/:quoteId/financial */
  async saveFinancial(
    quoteId: string,
    payload: SaveQuoteFinancialPayload,
  ): Promise<QuoteFinancialSnapshot> {
    const { data } = await api.patch<QuoteFinancialSnapshot>(
      `/quotes/draft/${quoteId}/financial`,
      payload,
    );
    return data;
  },

  /** PUT /quotes/draft/:quoteId/submit */
  async submitDraft(quoteId: string): Promise<QuoteStatusResponse> {
    const { data } = await api.put<QuoteStatusResponse>(
      `/quotes/draft/${quoteId}/submit`,
    );
    return data;
  },
};
