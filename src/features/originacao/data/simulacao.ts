export type ProdutoSimulacao = "Pessoal" | "Premium" | "Giro";

export const TAXA_PRODUTO: Record<ProdutoSimulacao, number> = {
  Pessoal: 3.39,
  Premium: 1.99,
  Giro: 2.89,
};

export const PRODUTOS = Object.keys(TAXA_PRODUTO) as ProdutoSimulacao[];

export const PARCELAS_OPCOES = Array.from({ length: 11 }, (_, i) => i + 2);

export const DIAS_VENCIMENTO_PERMITIDOS = [5, 10, 15, 20];

/** D+45: vencimento da 1ª parcela não pode passar disso a partir de hoje. */
export const LIMITE_DIAS_PRIMEIRA_PARCELA = 45;

export const VALOR_MIN = 500;
export const VALOR_MAX = 30_000;
export const VALOR_STEP = 100;
export const VALOR_PADRAO = 5_000;

export function ehDiaVencimentoPermitido(data: Date): boolean {
  return DIAS_VENCIMENTO_PERMITIDOS.includes(data.getDate());
}
