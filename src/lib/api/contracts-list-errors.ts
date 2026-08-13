import { getApiErrorMessage } from "@/lib/api/errors";

const CONTRACTS_LIST_ERROR_MESSAGES: Record<string, string> = {
  start_date_must_be_before_end_date:
    "A data inicial deve ser anterior à data final.",
};

export function getContractsListErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const raw = getApiErrorMessage(err, fallback);
  return CONTRACTS_LIST_ERROR_MESSAGES[raw] ?? raw;
}
