import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";
import { formatCep } from "@/features/originacao/utils/format-cep";
import { formatPhone } from "@/lib/format/phone";
import type { PartyFormData } from "@/services/parties/parties.types";

export interface GuarantorPartyFill {
  name?: string;
  email?: string;
  phone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

/** Telefone da party pode vir com DDI 55. */
export function formatPartyTelephone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }
  return formatPhone(digits);
}

/** Campos do avalista a partir do GET /parties/by-cpf. Não inclui CPF, nascimento nem parentesco. */
export function mapPartyToGuarantorFill(
  party: PartyFormData,
): GuarantorPartyFill {
  const fill: GuarantorPartyFill = {};
  const name = party.name.trim();
  if (name) fill.name = name;

  const email = party.email?.trim();
  if (email) fill.email = email;

  const phone = party.telephone?.trim();
  if (phone) fill.phone = formatPartyTelephone(phone);

  if (!party.address) return fill;

  const zip = party.address.zipCode.replace(/\D/g, "");
  if (zip.length === 8) fill.zipCode = formatCep(zip);

  const street = party.address.streetName.trim();
  if (street) fill.street = street;

  const number = formatAddressNumber(party.address.streetNumber);
  if (number) fill.number = number;

  const complement = party.address.streetComplement.trim();
  if (complement) fill.complement = complement;

  const neighborhood = party.address.streetDistrict.trim();
  if (neighborhood) fill.neighborhood = neighborhood;

  const city = party.address.city.trim();
  if (city) fill.city = city;

  const state = party.address.state?.trim().toUpperCase() ?? "";
  if (state) fill.state = state;

  return fill;
}
