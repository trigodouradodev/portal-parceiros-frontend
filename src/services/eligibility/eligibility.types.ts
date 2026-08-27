/**
 * Types matching portal-parceiros-backend/src/eligibility/
 */

export interface CheckEligibilityPayload {
  name: string;
  document: string;
  birthDate: string;
}

export interface EligibilityResult {
  eligible: boolean;
  name: string;
  document: string;
  birthDate: string;
}
