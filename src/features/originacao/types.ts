/** Dados repassados da elegibilidade para pré-preencher a simulação. */
export interface DadosElegibilidade {
  nome: string;
  cpf: string;
  nascimento: string;
}

/** Snapshot de simulação — shape do design; API virá depois. */
export interface SimulacaoSnapshot {
  id: string;
  criadaEm: string;
  nome: string;
  nascimento: string;
  produto: string;
  taxa: number;
  cpf: string;
  email: string;
  celular: string;
  valor: number;
  parcelas: number;
  vencimento: number;
  parcelaCalc: number;
}

export type OriginacaoTab = "elegibilidade" | "simulacao" | "proposta";
