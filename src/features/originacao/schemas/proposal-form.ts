import { z } from "zod";
import {
  DEBT_PURPOSE,
  HOW_KNOWS_OTHER,
  OTHER_OPTION,
  hasSpouse,
  type ActivityIncomeData,
  type AddressData,
  type DocumentsData,
  type GuarantorData,
  type PartnerOpinionData,
  type ProposalFormData,
  type RegistrationData,
} from "@/features/originacao/data/proposal";
import {
  GUARANTOR_BIRTH_DATE_MESSAGE,
  birthDateSchema,
} from "@/features/originacao/schemas/birth-date";
import { isCompleteCep } from "@/features/originacao/utils/format-cep";
import { isOptionalCpfValid, isValidCpf } from "@/lib/validation/cpf";

export const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";

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
      gender: requiredString,
      rg: requiredString,
      activityCategories: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
      activityCategoryOther: z.string(),
      occupation: z.string().trim().min(2, REQUIRED_FIELD_MESSAGE),
      maritalStatus: requiredString,
      spouseCpf: cpfSchema(hasSpouse(data.maritalStatus)),
      childrenCount: countString(0),
      householdSize: countString(1),
      propertyStatus: requiredString,
      residenceTime: requiredString,
      governmentPrograms: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
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
      if (
        form.activityCategories.includes(OTHER_OPTION) &&
        form.activityCategoryOther.trim() === ""
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["activityCategoryOther"],
          message: REQUIRED_FIELD_MESSAGE,
        });
      }
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

export const activityIncomeSchema: z.ZodType<ActivityIncomeData> = z
  .object({
    cnpj: z.string(),
    activityTime: requiredString,
    monthlyIncome: requiredString,
    incomeSource: requiredString,
    hasMultipleSources: z.boolean().nullable(),
    secondaryIncome: z.string(),
    availableProof: requiredString,
  })
  .superRefine((data, ctx) => {
    if (
      data.hasMultipleSources === true &&
      data.secondaryIncome.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["secondaryIncome"],
        message: REQUIRED_FIELD_MESSAGE,
      });
    }
  });

export const addressSchema: z.ZodType<AddressData> = addressCoreSchema.extend({
  landmark: z.string(),
});

export const partnerOpinionSchema: z.ZodType<PartnerOpinionData> = z
  .object({
    relationshipTime: requiredString,
    howKnows: requiredString,
    howKnowsOther: z.string(),
    referrerCpf: z.string().refine(isOptionalCpfValid, "CPF inválido"),
    overallRating: requiredString,
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
  });

export const guarantorSchema: z.ZodType<GuarantorData> = z.object({
  name: requiredString,
  cpf: cpfSchema(true),
  birthDate: birthDateSchema(GUARANTOR_BIRTH_DATE_MESSAGE),
  email: requiredString,
  phone: requiredString,
  zipCode: cepSchema(),
  street: z.string(),
  number: requiredString,
  complement: z.string(),
  neighborhood: requiredString,
  city: requiredString,
  state: requiredString,
  kinship: requiredString,
});

export const documentsSchema: z.ZodType<DocumentsData> = z.object({
  identification: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
  proofOfResidence: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
  activityPhotos: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
  incomeProofTypes: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
  incomeProofs: z.array(z.string()).min(1, REQUIRED_FIELD_MESSAGE),
});

const STEP_SCHEMAS = [
  null,
  activityIncomeSchema,
  addressSchema,
  partnerOpinionSchema,
  guarantorSchema,
  null,
  documentsSchema,
] as const;

type StepKey = Exclude<keyof ProposalFormData, "financial">;

const STEP_KEYS: Array<StepKey | null> = [
  "registration",
  "activityIncome",
  "address",
  "partnerOpinion",
  "guarantor",
  null,
  "documents",
];

export function parseProposalStep(step: number, data: ProposalFormData) {
  if (step === 0) {
    return registrationSchemaFor(data.registration).safeParse(
      data.registration,
    );
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

export function isFinancialValid(): boolean {
  return true;
}

export function isDocumentsValid(data: DocumentsData): boolean {
  return documentsSchema.safeParse(data).success;
}
