import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CATEGORY_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  GENDER_OPTIONS,
  GOVERNMENT_PROGRAM_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  RESIDENCE_TIME_OPTIONS,
  createEmptyProposalForm,
  type RegistrationData,
} from "@/features/originacao/data/proposal";
import { mapRegistrationToApi } from "@/features/originacao/mappers/map-registration-to-api";
import {
  CreditPurpose,
  EconomicActivityCategory,
  Gender,
  GovernmentProgram,
  HousingStatus,
  MaritalStatus,
  ResidenceDuration,
} from "@/services/quotes/quotes.enums";

function completeRegistration(
  overrides: Partial<RegistrationData> = {},
): RegistrationData {
  return {
    ...createEmptyProposalForm().registration,
    isRenewal: true,
    gender: Gender.FEMALE,
    rg: "12.345.678-9",
    occupation: "Vendedora",
    activityCategories: [EconomicActivityCategory.CLT_EMPLOYEE],
    maritalStatus: MaritalStatus.SINGLE,
    childrenCount: "0",
    householdSize: "3",
    propertyStatus: HousingStatus.RENTED,
    residenceTime: ResidenceDuration.SIX_MONTHS_TO_2_YEARS,
    governmentPrograms: [GovernmentProgram.NONE],
    hasVehicle: false,
    creditPurpose: CreditPurpose.PERSONAL_EXPENSE,
    ...overrides,
  };
}

describe("mapRegistrationToApi", () => {
  it("maps form codes to the registration PATCH payload", () => {
    expect(mapRegistrationToApi(completeRegistration())).toEqual({
      isRenegotiation: true,
      gender: "female",
      secondaryDocument: "12.345.678-9",
      profession: "Vendedora",
      economicActivityCategories: ["clt_employee"],
      maritalStatus: "single",
      childrenCount: 0,
      householdMembers: 3,
      housingStatus: "rented",
      residenceDuration: "6_months_to_2_years",
      governmentPrograms: ["none"],
      ownsVehicle: false,
      creditPurpose: "personal_expense",
    });
  });

  it("sends spouse CPF digits and vehicle financing only when they apply", () => {
    expect(
      mapRegistrationToApi(
        completeRegistration({
          isRenewal: false,
          maritalStatus: MaritalStatus.MARRIED,
          spouseCpf: "111.444.777-35",
          hasVehicle: true,
          vehicleFinanced: false,
          activityCategories: [EconomicActivityCategory.OTHER],
          activityCategoryOther: "Feirante",
        }),
      ),
    ).toEqual({
      isRenegotiation: false,
      gender: "female",
      secondaryDocument: "12.345.678-9",
      profession: "Vendedora",
      economicActivityCategories: ["other"],
      economicActivityOther: "Feirante",
      maritalStatus: "married",
      spouseDocument: "11144477735",
      childrenCount: 0,
      householdMembers: 3,
      housingStatus: "rented",
      residenceDuration: "6_months_to_2_years",
      governmentPrograms: ["none"],
      ownsVehicle: true,
      vehicleFinanced: false,
      creditPurpose: "personal_expense",
    });
  });

  it("does not send debt fields from the cadastro step", () => {
    const payload = mapRegistrationToApi(
      completeRegistration({
        creditPurpose: CreditPurpose.DEBT_PAYOFF_OR_REFINANCING,
        debtDescription: "Cartão",
        debtCreditor: "Banco",
      }),
    );
    expect(payload).not.toHaveProperty("debtDescription");
    expect(payload).not.toHaveProperty("debtCreditor");
    expect(payload.creditPurpose).toBe("debt_payoff_or_refinancing");
  });

  it("maps every cadastro option used in the form", () => {
    for (const option of GENDER_OPTIONS) {
      expect(
        mapRegistrationToApi(completeRegistration({ gender: option.value }))
          .gender,
      ).toBe(option.value);
    }
    for (const option of ACTIVITY_CATEGORY_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({
            activityCategories: [option.value],
            activityCategoryOther:
              option.value === EconomicActivityCategory.OTHER
                ? "Artesanato"
                : "",
          }),
        ).economicActivityCategories[0],
      ).toBe(option.value);
    }
    for (const option of MARITAL_STATUS_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({
            maritalStatus: option.value,
            spouseCpf:
              option.value === MaritalStatus.MARRIED ||
              option.value === MaritalStatus.STABLE_UNION
                ? "111.444.777-35"
                : "",
          }),
        ).maritalStatus,
      ).toBe(option.value);
    }
    for (const option of PROPERTY_STATUS_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({ propertyStatus: option.value }),
        ).housingStatus,
      ).toBe(option.value);
    }
    for (const option of RESIDENCE_TIME_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({ residenceTime: option.value }),
        ).residenceDuration,
      ).toBe(option.value);
    }
    for (const option of GOVERNMENT_PROGRAM_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({ governmentPrograms: [option.value] }),
        ).governmentPrograms[0],
      ).toBe(option.value);
    }
    for (const option of CREDIT_PURPOSE_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({ creditPurpose: option.value }),
        ).creditPurpose,
      ).toBe(option.value);
    }
  });
});
