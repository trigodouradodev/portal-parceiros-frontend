export interface PartyFormAddress {
  zipCode: string;
  streetName: string;
  streetNumber: string;
  streetComplement: string;
  streetDistrict: string;
  city: string;
  state: string | null;
}

export interface PartyFormData {
  name: string;
  document: string;
  email: string | null;
  telephone: string | null;
  address: PartyFormAddress | null;
}

export interface PartyFormLookupResponse {
  party: PartyFormData | null;
}
