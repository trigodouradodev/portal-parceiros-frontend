/** Espelha portal-parceiros-backend/src/follow-up/enums/follow-up.enums.ts */

export const FollowUpStatus = {
  CONTACTED: "contacted",
  NO_ANSWER: "no_answer",
  PROMISE_TO_PAY: "promise_to_pay",
  DISPUTE: "dispute",
  OTHER: "other",
  CLIENT_CALL: "client_call",
  GUARANTOR_CALL: "guarantor_call",
  CLIENT_VISIT: "client_visit",
  GUARANTOR_VISIT: "guarantor_visit",
  CLIENT_COLLECTION_LETTER: "client_collection_letter",
  GUARANTOR_COLLECTION_LETTER: "guarantor_collection_letter",
  NEGATIVATION: "negativation",
  RENEGOTIATION: "renegotiation",
  DECEASED: "deceased",
  NO_FORECAST: "no_forecast",
  NOT_LOCATED: "not_located",
  WHATSAPP_MESSAGE: "whatsapp_message",
} as const;

export type FollowUpStatus =
  (typeof FollowUpStatus)[keyof typeof FollowUpStatus];

export const FollowUpType = {
  CALL: "call",
  MESSAGE: "message",
  VISIT: "visit",
  AUTOMATIC: "automatic",
} as const;

export type FollowUpType = (typeof FollowUpType)[keyof typeof FollowUpType];

export const FollowUpParty = {
  CLIENT: "client",
  GUARANTOR: "guarantor",
} as const;

export type FollowUpParty = (typeof FollowUpParty)[keyof typeof FollowUpParty];

export const AutomaticFollowUpAction = {
  COLLECTION_LETTER: "collection_letter",
  NEGATIVATION: "negativation",
  RENEGOTIATION: "renegotiation",
} as const;

export type AutomaticFollowUpAction =
  (typeof AutomaticFollowUpAction)[keyof typeof AutomaticFollowUpAction];

export const FollowUpExpectedResult = {
  WILL_PAY_ON_DATE: "will_pay_on_date",
  NO_RETURN: "no_return",
  REQUESTED_EXTENSION: "requested_extension",
  DISPUTE: "dispute",
  WANTS_RENEGOTIATION: "wants_renegotiation",
  DECEASED: "deceased",
  NO_FORECAST: "no_forecast",
  NOT_LOCATED: "not_located",
  OTHER: "other",
} as const;

export type FollowUpExpectedResult =
  (typeof FollowUpExpectedResult)[keyof typeof FollowUpExpectedResult];

export interface CreateFollowUpPayload {
  contractId: string;
  installmentNumber?: number;
  status?: FollowUpStatus;
  followUpType?: FollowUpType;
  party?: FollowUpParty;
  automaticAction?: AutomaticFollowUpAction;
  note?: string;
  expectedResult?: FollowUpExpectedResult;
  paymentForecast?: string;
  latitude?: number;
  longitude?: number;
}

export interface FollowUpResponse {
  id: string;
  contract_id: string;
  installment_number: number | null;
  status: string;
  note: string | null;
  expected_result: string | null;
  payment_forecast: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
