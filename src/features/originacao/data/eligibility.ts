import { isValidCpf } from "@/features/originacao/utils/is-valid-cpf";

/**
 * Mock de elegibilidade: resultado determinístico por CPF
 * (~1/4 elegíveis). Substituir por API quando existir.
 */
export function isEligibleCpf(cpf: string): boolean {
  if (!isValidCpf(cpf)) return false;
  const digits = cpf.replace(/\D/g, "");
  const sum = digits.split("").reduce((total, d) => total + Number(d), 0);
  return sum % 4 === 0;
}
