import type { CepLookupErrorCode } from "@/services/cep/cep.types";

export class CepLookupError extends Error {
  readonly code: CepLookupErrorCode;

  constructor(message: string, code: CepLookupErrorCode) {
    super(message);
    this.name = "CepLookupError";
    this.code = code;
  }
}

export function isCepLookupError(error: unknown): error is CepLookupError {
  return error instanceof CepLookupError;
}
