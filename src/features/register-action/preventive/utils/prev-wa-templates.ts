import type { WaTemplate } from "@/features/register-action/types/wa-template";

export type { WaTemplate };

export function getPrevWaTemplates(client: {
  name: string;
  parcela: string;
  daysInfo: string;
}): WaTemplate[] {
  const name = client.name.split(" ")[0];
  const { parcela, daysInfo } = client;

  if (daysInfo === "Vence hoje") {
    return [
      {
        tag: "Amigável",
        message: `Olá, ${name}! 👋 Passando para lembrar que hoje é o dia do vencimento da sua parcela Aurea (${parcela}). Caso já tenha pago, desconsidere. Qualquer dúvida, estou aqui!`,
      },
      {
        tag: "Formal",
        message: `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea vence hoje. Por gentileza, verifique se o pagamento foi efetuado. Obrigado.`,
      },
    ];
  }

  if (daysInfo === "Vence amanhã") {
    return [
      {
        tag: "Amigável",
        message: `Olá, ${name}! 👋 Lembrete da Aurea: sua parcela (${parcela}) vence amanhã. Se precisar de ajuda com o pagamento, estou à disposição!`,
      },
      {
        tag: "Formal",
        message: `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea vence amanhã. Por gentileza, verifique se o pagamento será efetuado. Obrigado.`,
      },
    ];
  }

  if (daysInfo === "Vence em 2 dias") {
    return [
      {
        tag: "Amigável",
        message: `Oi, ${name}! 😊 Aqui é da Aurea. Sua parcela (${parcela}) vence em 2 dias. Se precisar de qualquer informação sobre o pagamento, pode me chamar!`,
      },
      {
        tag: "Formal",
        message: `Olá, ${name}. Lembrete: sua parcela Aurea (${parcela}) vence em 2 dias. Em caso de dúvidas, entre em contato. Obrigado!`,
      },
    ];
  }

  return [
    {
      tag: "Amigável",
      message: `Olá, ${name}! 👋 Aqui é da Aurea. Passando para lembrar que a parcela ${parcela} do seu contrato vence em breve. Qualquer dúvida, é só chamar!`,
    },
    {
      tag: "Formal",
      message: `Prezado(a) ${name}, notificação antecipada: a parcela ${parcela} do seu contrato Aurea tem vencimento próximo. Em caso de dúvidas, entre em contato.`,
    },
  ];
}
