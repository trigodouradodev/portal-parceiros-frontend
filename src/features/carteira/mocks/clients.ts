export interface CarteiraClient {
  id: string;
  name: string;
  contract: string;
  parcela: string;
  value: number;
  overdueDays: number;
}

export const carteiraClients: CarteiraClient[] = [
  {
    id: "c1",
    name: "Ricardo Alves",
    contract: "Contrato #0009",
    parcela: "Parc 9/10",
    value: 5600,
    overdueDays: 32,
  },
  {
    id: "c2",
    name: "João da Silva",
    contract: "Contrato #0032",
    parcela: "Parc 4/8",
    value: 1800,
    overdueDays: 15,
  },
  {
    id: "c3",
    name: "Fernanda Costa",
    contract: "Contrato #0065",
    parcela: "Parc 2/6",
    value: 450,
    overdueDays: 8,
  },
  {
    id: "c4",
    name: "Lúcia Barros",
    contract: "Contrato #0073",
    parcela: "Parc 1/6",
    value: 920,
    overdueDays: 3,
  },
];
