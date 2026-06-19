export interface WaTemplate {
  tag: string;
  message: string;
}

export function getCobrWaTemplates(client: {
  name: string;
  parcela: string;
  value: string;
  daysInfo: string;
}): WaTemplate[] {
  const name = client.name.split(" ")[0];
  const { parcela, value, daysInfo } = client;

  return [
    {
      tag: "Amigável",
      message: `Olá, ${name}! 👋 Aqui é da Aurea. Passando para lembrar que a parcela ${parcela} (${value}) está em atraso há ${daysInfo}. Podemos ajudar com o pagamento? Qualquer dúvida, estou à disposição!`,
    },
    {
      tag: "Formal",
      message: `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea, no valor de ${value}, encontra-se em atraso (${daysInfo}). Por gentileza, entre em contato para regularizar a situação. Obrigado.`,
    },
  ];
}
