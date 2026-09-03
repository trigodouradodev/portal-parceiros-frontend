/** Resposta de GET /locations/postal-code/:zipCode */
export interface PostalCodeAddress {
  zipCode: string;
  streetName: string;
  streetComplement?: string;
  streetDistrict: string;
  city: string;
  state: string;
}
