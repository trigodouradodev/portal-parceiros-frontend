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

function completeRegistration(
  overrides: Partial<RegistrationData> = {},
): RegistrationData {
  return {
    ...createEmptyProposalForm().registration,
    isRenewal: true,
    gender: "Feminino",
    rg: "12.345.678-9",
    occupation: "Vendedora",
    activityCategories: ["Empregado CLT"],
    maritalStatus: "Solteiro(a)",
    childrenCount: "0",
    householdSize: "3",
    propertyStatus: "Alugado",
    residenceTime: "6 meses a 2 anos",
    governmentPrograms: ["Nenhum"],
    hasVehicle: false,
    creditPurpose: "Despesa pessoal",
    ...overrides,
  };
}

describe("mapRegistrationToApi", () => {
  it("maps labels to backend codes and omits unused conditional fields", () => {
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
          maritalStatus: "Casado(a)",
          spouseCpf: "111.444.777-35",
          hasVehicle: true,
          vehicleFinanced: false,
          activityCategories: ["Outros"],
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
        creditPurpose: "Quitação/troca de dívida",
        debtDescription: "Cartão",
        debtCreditor: "Banco",
      }),
    );
    expect(payload).not.toHaveProperty("debtDescription");
    expect(payload).not.toHaveProperty("debtCreditor");
    expect(payload.creditPurpose).toBe("debt_payoff_or_refinancing");
  });

  it("maps every cadastro option used in the form", () => {
    for (const label of GENDER_OPTIONS) {
      expect(
        mapRegistrationToApi(completeRegistration({ gender: label })).gender,
      ).toBeTruthy();
    }
    for (const label of ACTIVITY_CATEGORY_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({
            activityCategories: [label],
            activityCategoryOther: label === "Outros" ? "Artesanato" : "",
          }),
        ).economicActivityCategories[0],
      ).toBeTruthy();
    }
    for (const label of MARITAL_STATUS_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({
            maritalStatus: label,
            spouseCpf:
              label === "Casado(a)" || label === "União estável"
                ? "111.444.777-35"
                : "",
          }),
        ).maritalStatus,
      ).toBeTruthy();
    }
    for (const label of PROPERTY_STATUS_OPTIONS) {
      expect(
        mapRegistrationToApi(completeRegistration({ propertyStatus: label }))
          .housingStatus,
      ).toBeTruthy();
    }
    for (const label of RESIDENCE_TIME_OPTIONS) {
      expect(
        mapRegistrationToApi(completeRegistration({ residenceTime: label }))
          .residenceDuration,
      ).toBeTruthy();
    }
    for (const label of GOVERNMENT_PROGRAM_OPTIONS) {
      expect(
        mapRegistrationToApi(
          completeRegistration({ governmentPrograms: [label] }),
        ).governmentPrograms[0],
      ).toBeTruthy();
    }
    for (const label of CREDIT_PURPOSE_OPTIONS) {
      expect(
        mapRegistrationToApi(completeRegistration({ creditPurpose: label }))
          .creditPurpose,
      ).toBeTruthy();
    }
  });
});
