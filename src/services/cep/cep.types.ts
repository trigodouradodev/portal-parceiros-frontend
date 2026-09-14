/** Resposta bruta do ViaCEP (`GET /ws/{cep}/json/`). */
export interface ViaCepResponse {
  erro?: boolean;
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  estado?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

/** Endereço no formato do formulário de originação. */
export interface CepLookupResult {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type CepLookupErrorCode =
  | "invalid"
  | "not_found"
  | "timeout"
  | "network";
