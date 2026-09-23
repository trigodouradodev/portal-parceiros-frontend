import { z } from "zod";
import {
  DEBT_PURPOSE,
  HOW_KNOWS_OTHER,
  AUREA_REFERRAL_OPTION,
  OTHER_OPTION,
  hasSpouse,
  requiresProfession,
  type ActivityIncomeData,
  type AddressData,
  type DocumentsData,
  type FinancialData,
  type GuarantorData,
  type PartnerOpinionData,
  type ProposalFormData,
  type RegistrationData,
} from "@/features/originacao/data/proposal";
import {
  CLIENT_BIRTH_DATE_MESSAGE,
  GUARANTOR_BIRTH_DATE_MESSAGE,
  birthDateSchema,
} from "@/features/originacao/schemas/birth-date";
import { isCompleteCep } from "@/features/originacao/utils/format-cep";
import { parseMoneyBrl } from "@/lib/format/money";
import { digitsOnlyPhone } from "@/lib/format/phone";
import { isOptionalCpfValid, isValidCpf } from "@/lib/validation/cpf";
import { addPaymentPixFormatIssues } from "@/features/originacao/schemas/pix-key-validation";
import { IncomeSource } from "@/services/quotes/quotes.enums";

export const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";
export const POSITIVE_MONEY_MESSAGE = "Informe um valor maior que zero";

const requiredString = z.string().trim().min(1, REQUIRED_FIELD_MESSAGE);

const requiredYesNo = z.custom<boolean | null>(
  (value) => value === true || value === false,
  REQUIRED_FIELD_MESSAGE,
);

function cepSchema() {
  return z.string().superRefine((value, ctx) => {
    if (isCompleteCep(value)) return;
    ctx.addIssue({
      code: "custom",
      message:
        value.trim() === "" ? REQUIRED_FIELD_MESSAGE : "Informe um CEP válido",
    });
  });
}

function countString(min: number) {
  return z.string().superRefine((value, ctx) => {
    const digits = value.replace(/\D/g, "");
    if (digits === "" || Number(digits) < min) {
      ctx.addIssue({ code: "custom", message: REQUIRED_FIELD_MESSAGE });
    }
  });
}

/** Valor monetário mascarado (BRL) obrigatório e maior que zero (AUREA-482). */
function positiveMoneyString() {
  return z.string().superRefine((value, ctx) => {
    if (value.trim() === "") {
      ctx.addIssue({ code: "custom", message: REQUIRED_FIELD_MESSAGE });
      return;
    }
    if (parseMoneyBrl(value) < 0.01) {
      ctx.addIssue({ code: "custom", message: POSITIVE_MONEY_MESSAGE });
    }
  });
}

function cpfSchema(required: boolean) {
  return z.string().superRefine((value, ctx) => {
    if (required) {
      if (isValidCpf(value)) return;
      ctx.addIssue({
        code: "custom",
        message:
          value.replace(/\D/g, "").length === 0
            ? REQUIRED_FIELD_MESSAGE
            : "CPF inválido",
      });
      return;
    }
    if (!isOptionalCpfValid(value)) {
      ctx.addIssue({ code: "custom", message: "CPF inválido" });
    }
  });
}

const addressCoreSchema = z.object({
  zipCode: cepSchema(),
  street: requiredString,
  number: requiredString,
  complement: z.string(),
  neighborhood: requiredString,
  city: requiredString,
  state: requiredString,
});

function registrationSchemaFor(data: RegistrationData) {
  return z
    .object({
      isRenewal: requiredYesNo,
      name: z.string().trim().min(3, "Informe o nome completo"),
      birthDate: birthDateSchema(CLIENT_BIRTH_DATE_MESSAGE),
      gender: requiredString,
      cpf: cpfSchema(true),
      rg: requiredString,
      activityCategories: z.array(z.string()),
      activityCategoryOther: z.string(),
      occupation: z.string(),
      businessActivityBranch: z.string(),
      businessActivitySubcategory: z.string(),
      email: z
        .string()
        .trim()
        .min(1, "Informe o e-mail")
        .email("Informe um e-mail válido"),
      phone: z
        .string()
        .refine(
          (value) => digitsOnlyPhone(value).length >= 10,
          "Informe um celular válido",
        ),
      maritalStatus: requiredString,
      spouseCpf: cpfSchema(hasSpouse(data.maritalStatus)),
      childrenCount: countString(0),
      householdSize: countString(1),
      propertyStatus: requiredString,
      residenceTime: requiredString,
      governmentPrograms: z.array(z.string()),
      hasVehicle: requiredYesNo,
      vehicleFinanced: z.boolean().nullable(),
      creditPurpose: z
        .string()
        .nullable()
        .refine(
          (value) => value != null && value !== "",
          REQUIRED_FIELD_MESSAGE,
        ),
      debtDescription: z.string(),
      debtCreditor: z.string(),
    })
    .superRefine((form, ctx) => {
      if (form.hasVehicle === true && form.vehicleFinanced == null) {
        ctx.addIssue({
          code: "custom",
          path: ["vehicleFinanced"],
          message: REQUIRED_FIELD_MESSAGE,
        });
      }
      if (form.creditPurpose === DEBT_PURPOSE) {
        if (form.debtDescription.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["debtDescription"],
            message: REQUIRED_FIELD_MESSAGE,
          });
        }
        if (form.debtCreditor.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["debtCreditor"],
            message: REQUIRED_FIELD_MESSAGE,
          });
        }
      }
    });
}

const additionalIncomeSchema = z
  .object({
    id: z.number(),
    activityCategories: z.array(requiredString).min(1, REQUIRED_FIELD_MESSAGE),
    activityCategoryOther: z.string(),
    occupation: z.string(),
    businessActivityBranch: requiredString,
    businessActivitySubcategory: requiredString,
    activityTime: requiredString,
    source: requiredString,
    amount: positiveMoneyString(),
    familyRelationship: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      data.activityCategories.includes(OTHER_OPTION) &&
      data.activityCategoryOther.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["activityCategoryOther"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (
      requiresProfession(data.activityCategories) &&
      data.occupation.trim().length < 2
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["occupation"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (
      data.source === IncomeSource.FAMILY_INCOME &&
      data.familyRelationship.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["familyRelationship"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
  });

export const activityIncomeSchema: z.ZodType<ActivityIncomeData> = z.object({
  activityTime: requiredString,
  monthlyIncome: positiveMoneyString(),
  incomeSource: requiredString.refine(
    (value) => value !== IncomeSource.FAMILY_INCOME,
    "Renda Familiar é permitida apenas como renda secundária",
  ),
  additionalIncomes: z.array(additionalIncomeSchema).max(9),
  nextAdditionalIncomeId: z.number(),
});

export const addressSchema: z.ZodType<AddressData> = addressCoreSchema.extend({
  landmark: requiredString,
  geolocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      precision: z.string().min(1),
    })
    .nullable()
    .optional(),
});

export const partnerOpinionSchema: z.ZodType<PartnerOpinionData> = z
  .object({
    relationshipTime: requiredString,
    howKnows: requiredString,
    howKnowsOther: z.string(),
    referrerCpf: z.string().refine(isOptionalCpfValid, "CPF inválido"),
    overallRating: z.string(),
    informalDebtSigns: requiredYesNo,
    financialUrgencySigns: requiredYesNo,
    notes: requiredString,
  })
  .superRefine((data, ctx) => {
    if (data.howKnows === HOW_KNOWS_OTHER && data.howKnowsOther.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["howKnowsOther"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (data.howKnows === AUREA_REFERRAL_OPTION) {
      if (isValidCpf(data.referrerCpf)) return;
      ctx.addIssue({
        code: "custom",
        path: ["referrerCpf"],
        message:
          data.referrerCpf.replace(/\D/g, "").length === 0
            ? REQUIRED_FIELD_MESSAGE
            : "CPF inválido",
      });
    }
  });

export const guarantorSchema: z.ZodType<GuarantorData> = z.object({
  name: requiredString,
  cpf: cpfSchema(true),
  birthDate: birthDateSchema(GUARANTOR_BIRTH_DATE_MESSAGE),
  email: requiredString,
  phone: requiredString,
  zipCode: cepSchema(),
  street: requiredString,
  number: requiredString,
  complement: z.string(),
  neighborhood: requiredString,
  city: requiredString,
  state: requiredString,
  kinship: requiredString,
});

export const financialSchema: z.ZodType<FinancialData> = z
  .object({
    expenses: z.array(z.any()),
    loans: z.array(z.any()),
    nextId: z.number(),
    paymentPixType: requiredString,
    paymentPixCode: requiredString,
  })
  .superRefine((data, ctx) => {
    addPaymentPixFormatIssues(data, ctx, ["paymentPixCode"]);
  });

export const documentsSchema: z.ZodType<DocumentsData> = z
  .object({
    identification: z
      .array(
        z.object({
          id: z.string().min(1),
          filename: z.string().min(1),
          incomeProofType: z.string().optional(),
        }),
      )
      .min(1, REQUIRED_FIELD_MESSAGE),
    proofOfResidence: z
      .array(
        z.object({
          id: z.string().min(1),
          filename: z.string().min(1),
          incomeProofType: z.string().optional(),
        }),
      )
      .min(1, REQUIRED_FIELD_MESSAGE),
    activityPhotos: z
      .array(
        z.object({
          id: z.string().min(1),
          filename: z.string().min(1),
          incomeProofType: z.string().optional(),
        }),
      )
      .min(1, REQUIRED_FIELD_MESSAGE),
    incomeProofTypes: z.array(z.string()),
    incomeProofs: z.array(
      z.object({
        id: z.string().min(1),
        filename: z.string().min(1),
        incomeProofType: z.string().optional(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.incomeProofTypes.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["incomeProofTypes"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (data.incomeProofs.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["incomeProofs"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
  });

const STEP_SCHEMAS = [
  null,
  activityIncomeSchema,
  addressSchema,
  partnerOpinionSchema,
  guarantorSchema,
  financialSchema,
  documentsSchema,
] as const;

type StepKey = keyof ProposalFormData;

const STEP_KEYS: Array<StepKey | null> = [
  "registration",
  "activityIncome",
  "address",
  "partnerOpinion",
  "guarantor",
  "financial",
  "documents",
];

export function parseProposalStep(step: number, data: ProposalFormData) {
  if (step === 0) {
    return registrationSchemaFor(data.registration).safeParse(
      data.registration,
    );
  }
  if (step === 1) {
    // Atividade econômica, Profissão, Ramo de atividade e Subcategoria são
    // dados de `registration`, mas são exigidos e editados neste step — as
    // checagens abaixo seguem a mesma ordem visual da tela.
    const issues: Array<{ path: string[]; message: string }> = [];
    if (data.registration.activityCategories.length === 0) {
      issues.push({
        path: ["registration", "activityCategories"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    } else if (
      data.registration.activityCategories.includes(OTHER_OPTION) &&
      data.registration.activityCategoryOther.trim() === ""
    ) {
      issues.push({
        path: ["registration", "activityCategoryOther"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (
      requiresProfession(data.registration.activityCategories) &&
      data.registration.occupation.trim().length < 2
    ) {
      issues.push({
        path: ["registration", "occupation"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
    if (data.registration.businessActivityBranch.trim() === "") {
      issues.push({
        path: ["registration", "businessActivityBranch"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    } else if (data.registration.businessActivitySubcategory.trim() === "") {
      issues.push({
        path: ["registration", "businessActivitySubcategory"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }

    const parsed = activityIncomeSchema.safeParse(data.activityIncome);
    if (!parsed.success) {
      issues.push(
        ...parsed.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
        })),
      );
    }

    if (issues.length > 0) {
      return { success: false as const, error: { issues } };
    }
    return parsed;
  }
  const key = STEP_KEYS[step];
  const schema = STEP_SCHEMAS[step];
  if (!key || !schema) {
    return { success: true as const, error: undefined };
  }
  return schema.safeParse(data[key]);
}

export function isRegistrationValid(data: RegistrationData): boolean {
  return registrationSchemaFor(data).safeParse(data).success;
}

export function isActivityIncomeValid(data: ActivityIncomeData): boolean {
  return activityIncomeSchema.safeParse(data).success;
}

export function isAddressValid(data: AddressData): boolean {
  return addressSchema.safeParse(data).success;
}

export function isPartnerOpinionValid(data: PartnerOpinionData): boolean {
  return partnerOpinionSchema.safeParse(data).success;
}

export function isGuarantorValid(data: GuarantorData): boolean {
  return guarantorSchema.safeParse(data).success;
}

export function isFinancialValid(data: FinancialData): boolean {
  return financialSchema.safeParse(data).success;
}

export function isDocumentsValid(data: DocumentsData): boolean {
  return documentsSchema.safeParse(data).success;
}
