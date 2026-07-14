import { resolveQueueTone } from "@/features/dashboard/constants/charge-queue-tone";
import type { QueueTone } from "@/services/activities/activity.enums";

const VISIT_SCRIPTS: Record<QueueTone, string> = {
  friendly:
    "Apresente-se de forma cordial e explique que a parcela do contrato [CONTRATO] está em aberto. Ofereça alternativas de pagamento e pergunte se há algo que esteja impedindo a regularização.",
  firm: "Informe que esta é a segunda tentativa de contato e que, sem acordo hoje, será encaminhada uma carta de cobrança formal. Anote declaração do cliente e registre o resultado da visita.",
  severe:
    "Informe que o processo de negativação será iniciado. Leve documentação da dívida. Registre com precisão a declaração do cliente e o resultado da visita.",
};

const CALL_SCRIPTS: Record<QueueTone, string> = {
  friendly:
    "Bom dia/tarde, [NOME]! Aqui é [AGENTE] da Aurea. Estou ligando para lembrar que a parcela do contrato [CONTRATO] está pendente. Podemos verificar juntos a melhor forma de regularizar?",
  firm: "Bom dia/tarde, [NOME]. Aqui é [AGENTE] da Aurea. O contrato [CONTRATO] está em atraso e precisamos de uma definição urgente. Caso não consigamos um acordo, teremos que enviar uma carta de cobrança formal. Como podemos resolver isso hoje?",
  severe:
    "[NOME], sou [AGENTE] da Aurea. O contrato [CONTRATO] está com atraso significativo e será negativado nos próximos dias caso não haja regularização. Preciso de uma resposta agora para suspender esse processo.",
};

interface ScriptTokens {
  contract?: string;
  contactFirstName?: string;
  agentName?: string;
}

function applyScriptTokens(template: string, tokens: ScriptTokens): string {
  let result = template;
  if (tokens.contract) {
    result = result.split("[CONTRATO]").join(tokens.contract);
  }
  if (tokens.contactFirstName) {
    result = result.split("[NOME]").join(tokens.contactFirstName);
  }
  if (tokens.agentName) {
    result = result.split("[AGENTE]").join(tokens.agentName);
  }
  return result;
}

export function getVisitScript(
  queueTone?: QueueTone | string,
  contract?: string,
): string {
  const tone = resolveQueueTone(queueTone);
  return applyScriptTokens(VISIT_SCRIPTS[tone], { contract });
}

export function getCallScript(
  queueTone?: QueueTone | string,
  tokens: ScriptTokens = {},
): string {
  const tone = resolveQueueTone(queueTone);
  return applyScriptTokens(CALL_SCRIPTS[tone], {
    agentName: "o parceiro",
    ...tokens,
  });
}
