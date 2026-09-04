import { api } from "@/lib/api/axios";
import type {
  CreateDraftQuotePayload,
  ListQuotesQuery,
  QuoteAddressSnapshot,
  QuoteAttachmentSnapshot,
  QuoteDetail,
  QuoteDocumentationAttachments,
  QuoteDocumentationSnapshot,
  QuoteDraftSnapshot,
  QuoteFinancialSnapshot,
  QuoteGuarantorSnapshot,
  QuoteIncomeSnapshot,
  QuotePartnerOpinionSnapshot,
  QuoteRegistrationSnapshot,
  QuotesPage,
  QuoteStatusResponse,
  SaveQuoteAddressPayload,
  SaveQuoteFinancialPayload,
  SaveQuoteGuarantorPayload,
  SaveQuoteIncomePayload,
  SaveQuotePartnerOpinionPayload,
  SaveQuoteRegistrationPayload,
  UploadQuoteAttachmentInput,
} from "./quotes.types";

export const quotesKeys = {
  all: ["quotes"] as const,
  draftsRoot: () => [...quotesKeys.all, "drafts"] as const,
  draft: (quoteId: string) => [...quotesKeys.all, "draft", quoteId] as const,
  attachments: (quoteId: string) =>
    [...quotesKeys.draft(quoteId), "attachments"] as const,
  listRoot: () => [...quotesKeys.all, "list"] as const,
  list: (query: ListQuotesQuery = {}) =>
    [...quotesKeys.listRoot(), query] as const,
  detail: (quoteId: string) => [...quotesKeys.all, "detail", quoteId] as const,
};

function toMultipartBody(input: UploadQuoteAttachmentInput): FormData {
  const body = new FormData();
  body.append("attachmentType", input.attachmentType);
  if (input.incomeProofType) {
    body.append("incomeProofType", input.incomeProofType);
  }
  body.append("file", input.file);
  return body;
}

export const quotesService = {
  /** GET /quotes */
  async list(query: ListQuotesQuery = {}): Promise<QuotesPage> {
    const { data } = await api.get<QuotesPage>("/quotes", {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 30,
        ...(query.search ? { search: query.search } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
    return data;
  },

  /** GET /quotes/:quoteId */
  async getById(quoteId: string): Promise<QuoteDetail> {
    const { data } = await api.get<QuoteDetail>(`/quotes/${quoteId}`);
    return data;
  },

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

  /** POST /quotes/draft/:quoteId/attachments */
  async uploadAttachment(
    quoteId: string,
    input: UploadQuoteAttachmentInput,
  ): Promise<QuoteAttachmentSnapshot> {
    const { data } = await api.post<QuoteAttachmentSnapshot>(
      `/quotes/draft/${quoteId}/attachments`,
      toMultipartBody(input),
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: [
          (payload, headers) => {
            if (payload instanceof FormData) {
              delete headers["Content-Type"];
            }
            return payload;
          },
        ],
      },
    );
    return data;
  },

  /** GET /quotes/draft/:quoteId/attachments */
  async listAttachments(
    quoteId: string,
  ): Promise<QuoteDocumentationAttachments> {
    const { data } = await api.get<QuoteDocumentationAttachments>(
      `/quotes/draft/${quoteId}/attachments`,
    );
    return data;
  },

  /** DELETE /quotes/draft/:quoteId/attachments/:attachmentId */
  async removeAttachment(quoteId: string, attachmentId: string): Promise<void> {
    await api.delete(`/quotes/draft/${quoteId}/attachments/${attachmentId}`);
  },

  /** PATCH /quotes/draft/:quoteId/documentation */
  async completeDocumentation(
    quoteId: string,
  ): Promise<QuoteDocumentationSnapshot> {
    const { data } = await api.patch<QuoteDocumentationSnapshot>(
      `/quotes/draft/${quoteId}/documentation`,
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
