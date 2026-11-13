import { QuoteDeclineReason } from "@/services/quotes/quotes.enums";

export interface DeclineReasonOption {
  value: QuoteDeclineReason;
  label: string;
  /** Explica quando usar o motivo. Aparece abaixo do nome na lista. */
  description: string;
  /** Exige a observação do parceiro (o backend também confere). */
  noteRequired?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  noteRequiredMessage?: string;
}

export interface DeclineReasonGroup {
  id: string;
  title: string;
  options: DeclineReasonOption[];
}

/**
 * Motivos oferecidos ao parceiro ao recusar um rascunho da Canal Digital.
 * Rótulos e descrições vêm da lista do negócio; os grupos só organizam a
 * leitura (são 23 motivos).
 */
export const DECLINE_REASON_GROUPS: DeclineReasonGroup[] = [
  {
    id: "contact",
    title: "Contato e cadastro",
    options: [
      {
        value: QuoteDeclineReason.NO_RESPONSE,
        label: "Cliente não responde",
        description: "Não retornou após as tentativas de contato.",
      },
      {
        value: QuoteDeclineReason.INVALID_CONTACT,
        label: "Contato inválido",
        description: "Telefone incorreto, inexistente ou de outra pessoa.",
      },
      {
        value: QuoteDeclineReason.DOES_NOT_RECOGNIZE_REQUEST,
        label: "Não reconhece a solicitação",
        description: "Cliente informa que não pediu crédito.",
      },
      {
        value: QuoteDeclineReason.DUPLICATE_REGISTRATION,
        label: "Cadastro duplicado",
        description: "Já existe outra solicitação em andamento.",
      },
    ],
  },
  {
    id: "profile",
    title: "Perfil do cliente",
    options: [
      {
        value: QuoteDeclineReason.OUTSIDE_SERVICE_AREA,
        label: "Fora da região atendida",
        description: "Localidade sem atendimento da Aurea.",
      },
      {
        value: QuoteDeclineReason.PERSONAL_PURPOSE_CREDIT,
        label: "Crédito para finalidade pessoal",
        description: "A necessidade informada não está relacionada ao negócio.",
      },
      {
        value: QuoteDeclineReason.PRODUCT_CRITERIA_NOT_MET,
        label: "Não atende aos critérios do produto",
        description: "Não se enquadra nas condições da linha pretendida.",
        noteRequired: true,
        noteLabel: "Qual critério?",
        notePlaceholder: "Ex.: faturamento abaixo do mínimo da linha",
        noteRequiredMessage: "Informe o critério que o cliente não atende.",
      },
    ],
  },
  {
    id: "documents",
    title: "Documentação e exigências",
    options: [
      {
        value: QuoteDeclineReason.DOCUMENTS_NOT_SENT,
        label: "Não enviou a documentação",
        description: "Não concluiu o envio dos documentos solicitados.",
      },
      {
        value: QuoteDeclineReason.INCOME_NOT_PROVEN,
        label: "Não conseguiu comprovar renda ou atividade",
        description: "Não apresentou os comprovantes necessários para análise.",
      },
      {
        value: QuoteDeclineReason.NO_GUARANTOR,
        label: "Não possui avalista",
        description: "Não conseguiu apresentar avalista, quando exigido.",
      },
      {
        value: QuoteDeclineReason.DECLINED_SITE_VISIT,
        label: "Não aceitou a visita presencial",
        description: "Não quis seguir com essa etapa do processo.",
      },
    ],
  },
  {
    id: "offer",
    title: "Condições da oferta",
    options: [
      {
        value: QuoteDeclineReason.INTEREST_RATE_NOT_ACCEPTED,
        label: "Taxa de juros não aceita",
        description: "Considerou a taxa acima do que esperava.",
      },
      {
        value: QuoteDeclineReason.APPROVED_AMOUNT_INSUFFICIENT,
        label: "Valor aprovado insuficiente",
        description:
          "O valor disponibilizado não atende à necessidade do negócio.",
      },
      {
        value: QuoteDeclineReason.INSTALLMENT_OVER_BUDGET,
        label: "Parcela acima do orçamento",
        description: "O compromisso mensal não cabe no caixa do cliente.",
      },
      {
        value: QuoteDeclineReason.PAYMENT_TERM_UNSUITABLE,
        label: "Prazo de pagamento inadequado",
        description: "Precisa de um prazo diferente do oferecido.",
      },
      {
        value: QuoteDeclineReason.RELEASE_TIME_UNSUITABLE,
        label: "Prazo de liberação não atende",
        description: "Precisa do recurso antes do prazo informado.",
      },
    ],
  },
  {
    id: "client-decision",
    title: "Decisão do cliente",
    options: [
      {
        value: QuoteDeclineReason.HIRED_ANOTHER_INSTITUTION,
        label: "Contratou com outra instituição",
        description: "Resolveu a necessidade de crédito com outra empresa.",
      },
      {
        value: QuoteDeclineReason.NO_LONGER_NEEDS_CREDIT,
        label: "Não precisa mais do crédito",
        description: "A necessidade deixou de existir.",
      },
      {
        value: QuoteDeclineReason.POSTPONED,
        label: "Adiou a contratação",
        description:
          "Continua interessado, mas pretende contratar em outro momento.",
      },
      {
        value: QuoteDeclineReason.INSECURITY_ABOUT_COMPANY,
        label: "Insegurança sobre a empresa ou contratação",
        description:
          "Demonstrou receio e não quis prosseguir após os esclarecimentos.",
      },
      {
        value: QuoteDeclineReason.GAVE_UP_NO_REASON,
        label: "Desistiu sem informar o motivo",
        description: "Comunicou a desistência, mas não explicou a razão.",
      },
    ],
  },
  {
    id: "analysis",
    title: "Decisão da análise",
    options: [
      {
        value: QuoteDeclineReason.CREDIT_NOT_APPROVED,
        label: "Crédito não aprovado pela análise",
        description: "Houve uma decisão formal da equipe responsável.",
      },
    ],
  },
  {
    id: "other",
    title: "Outro",
    options: [
      {
        value: QuoteDeclineReason.OTHER,
        label: "Outro motivo",
        description: "Nenhum dos anteriores. Descreva brevemente.",
        noteRequired: true,
        noteLabel: "Descreva o motivo",
        noteRequiredMessage: "Descreva o motivo da recusa.",
      },
    ],
  },
];

export const DECLINE_REASON_OPTIONS: DeclineReasonOption[] =
  DECLINE_REASON_GROUPS.flatMap((group) => group.options);

export function findDeclineReason(
  value: string,
): DeclineReasonOption | undefined {
  return DECLINE_REASON_OPTIONS.find((option) => option.value === value);
}

export const DECLINE_NOTE_MAX_LENGTH = 500;
/** Tamanho mínimo da observação nos motivos que a exigem. */
export const DECLINE_NOTE_MIN_LENGTH = 3;
