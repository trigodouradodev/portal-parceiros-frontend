import type { WaTemplate } from "@/features/register-action/types/wa-template";
import { getStageToneMeta } from "@/features/dashboard/utils/collection-stage";
import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";

export type { WaTemplate };

function buildFriendlyMessage(
  name: string,
  parcela: string,
  value: string,
  daysInfo: string,
): string {
  return `Olá, ${name}! 👋 Aqui é da Aurea. Passando para lembrar que a parcela ${parcela} (${value}) está em atraso há ${daysInfo}. Podemos ajudar com o pagamento? Qualquer dúvida, estou à disposição!`;
}

function buildAssertiveMessage(
  name: string,
  parcela: string,
  value: string,
  daysInfo: string,
): string {
  return `Olá, ${name}. Sua parcela ${parcela} (${value}) segue em atraso (${daysInfo}). Por favor, entre em contato para regularizar a situação e evitar medidas adicionais.`;
}

function buildWarningMessage(
  name: string,
  parcela: string,
  value: string,
  daysInfo: string,
): string {
  return `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea, no valor de ${value}, permanece em atraso (${daysInfo}). Solicitamos a regularização com urgência.`;
}

function buildDefaultedMessage(
  name: string,
  parcela: string,
  value: string,
  daysInfo: string,
): string {
  return `Prezado(a) ${name}, a parcela ${parcela} (${value}) encontra-se em situação de inadimplência (${daysInfo}). Entre em contato imediatamente para negociar a regularização.`;
}

export function getWaTemplates(
  client: {
    name: string;
    parcela: string;
    value: string;
    daysInfo: string;
  },
  stageCode?: CollectionStageCode,
): WaTemplate[] {
  const name = client.name.split(" ")[0];
  const { parcela, value, daysInfo } = client;
  const toneMeta = getStageToneMeta(stageCode);
  const toneTag = toneMeta?.chipLabel ?? "Tom amigável";

  const primaryMessage = (() => {
    switch (stageCode) {
      case "assertive":
        return buildAssertiveMessage(name, parcela, value, daysInfo);
      case "warning":
        return buildWarningMessage(name, parcela, value, daysInfo);
      case "defaulted":
        return buildDefaultedMessage(name, parcela, value, daysInfo);
      case "friendly":
      default:
        return buildFriendlyMessage(name, parcela, value, daysInfo);
    }
  })();

  return [
    { tag: toneTag, message: primaryMessage },
    {
      tag: "Formal",
      message: `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea, no valor de ${value}, encontra-se em atraso (${daysInfo}). Por gentileza, entre em contato para regularizar a situação. Obrigado.`,
    },
  ];
}
