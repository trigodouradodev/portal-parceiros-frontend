import {
  getQueueToneLabel,
  resolveQueueTone,
} from "@/features/dashboard/constants/charge-queue-tone";
import type { WaTemplate } from "@/features/register-action/types/wa-template";
import type { QueueTone } from "@/services/activities/activity.enums";

export type { WaTemplate };

const WA_MESSAGES: Record<
  QueueTone,
  (tokens: {
    name: string;
    parcela: string;
    value: string;
    daysInfo: string;
  }) => string
> = {
  friendly: ({ name, parcela, value, daysInfo }) =>
    `Olá, ${name}! 👋 Aqui é da Aurea. Passando para lembrar que a parcela ${parcela} (${value}) está em atraso há ${daysInfo}. Podemos ajudar com o pagamento? Qualquer dúvida, estou à disposição!`,
  firm: ({ name, parcela, value, daysInfo }) =>
    `Olá, ${name}. Aqui é da Aurea. A parcela ${parcela} (${value}) está em atraso (${daysInfo}) e precisamos de uma definição. Caso não consigamos um acordo, teremos que enviar uma carta de cobrança formal. Como podemos resolver?`,
  severe: ({ name, parcela, value, daysInfo }) =>
    `${name}, sou da Aurea. A parcela ${parcela} (${value}) está com atraso significativo (${daysInfo}) e o processo de negativação será iniciado nos próximos dias sem regularização. Preciso de um retorno para suspender esse processo.`,
};

/** Uma mensagem por tom da régua — sem escolha do agente (HOME-08 / AUREA-244). */
export function getWaTemplates(
  client: {
    name: string;
    parcela: string;
    value: string;
    daysInfo: string;
  },
  queueTone?: QueueTone | string,
): WaTemplate[] {
  const tone = resolveQueueTone(queueTone);
  const name = client.name.split(" ")[0] ?? client.name;

  return [
    {
      tag: getQueueToneLabel(tone),
      message: WA_MESSAGES[tone]({
        name,
        parcela: client.parcela,
        value: client.value,
        daysInfo: client.daysInfo,
      }),
    },
  ];
}
