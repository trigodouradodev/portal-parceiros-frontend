import { api } from "@/lib/api/axios";

/** Espelha src/email-validation/enums/zero-bounce-status.enum.ts do backend. */
export const ZeroBounceStatus = {
  VALID: "valid",
  INVALID: "invalid",
  CATCH_ALL: "catch-all",
  UNKNOWN: "unknown",
  SPAMTRAP: "spamtrap",
  ABUSE: "abuse",
  DO_NOT_MAIL: "do_not_mail",
} as const;
export type ZeroBounceStatus =
  (typeof ZeroBounceStatus)[keyof typeof ZeroBounceStatus];

export interface EmailValidationResult {
  email: string;
  status: ZeroBounceStatus;
  subStatus: string;
  isAcceptable: boolean;
  checked: boolean;
  didYouMean: string | null;
}

export const emailValidationService = {
  /** POST /email-validation — nunca lança; ver `checked` no resultado. */
  async validate(email: string): Promise<EmailValidationResult> {
    const { data } = await api.post<EmailValidationResult>(
      "/email-validation",
      { email },
    );
    return data;
  },
};
