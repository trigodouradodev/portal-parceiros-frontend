/** Resposta de GET /locations/postal-code/:zipCode */
export interface PostalCodeAddress {
  zipCode: string;
  streetName: string;
  streetComplement?: string;
  streetDistrict: string;
  city: string;
  state: string;
}

/** Resposta de GET /locations/reverse-geocode */
export interface ReverseGeocodedAddress {
  zipCode: string | null;
  streetName: string | null;
  streetNumber: string | null;
  streetComplement: string | null;
  streetDistrict: string | null;
  city: string | null;
  state: string | null;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  locationType: string;
}
