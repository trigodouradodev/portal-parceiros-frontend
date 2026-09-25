import { useForm } from "react-hook-form";
import { fireEvent, render, screen } from "@testing-library/react";
import { Form } from "@/components/ui/form";
import { ActivityIncomeSection } from "@/features/originacao/components/proposta/ActivityIncomeSection";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  BusinessActivityBranch,
  BusinessActivitySubcategory,
  EconomicActivityCategory,
  IncomeSource,
} from "@/services/quotes/quotes.enums";

function renderActivityIncome(
  registrationOverrides: Partial<ProposalFormData["registration"]> = {},
  activityIncomeOverrides: Partial<ProposalFormData["activityIncome"]> = {},
) {
  function Harness() {
    const empty = createEmptyProposalForm();
    const form = useForm<ProposalFormData>({
      defaultValues: {
        ...empty,
        registration: {
          ...empty.registration,
          ...registrationOverrides,
        },
        activityIncome: {
          ...empty.activityIncome,
          ...activityIncomeOverrides,
        },
      },
    });

    return (
      <Form {...form}>
        <ActivityIncomeSection />
      </Form>
    );
  }

  return render(<Harness />);
}

function fieldTrigger(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("button") ?? null;
}

function fieldInput(name: string) {
  const root = document.getElementById(`field-${name}`);
  return root?.querySelector("input") ?? null;
}

function expectFieldBefore(first: string, second: string) {
  const firstField = document.getElementById(`field-${first}`);
  const secondField = document.getElementById(`field-${second}`);

  expect(firstField).not.toBeNull();
  expect(secondField).not.toBeNull();
  expect(
    firstField!.compareDocumentPosition(secondField!) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}

describe("ActivityIncomeSection", () => {
  it("groups atividade econômica, ramo de atividade and tempo na atividade, hiding profissão, a subcategoria and the activity-other field by default", () => {
    renderActivityIncome();

    expect(fieldTrigger("registration.activityCategories")).toBeTruthy();
    expect(fieldTrigger("registration.businessActivityBranch")).toBeTruthy();
    expect(fieldTrigger("activityIncome.activityTime")).toBeTruthy();
    expect(document.getElementById("field-registration.occupation")).toBeNull();
    expect(
      document.getElementById("field-registration.businessActivitySubcategory"),
    ).toBeNull();
    expect(
      document.getElementById("field-registration.activityCategoryOther"),
    ).toBeNull();
  });

  it("shows explanatory hints and the new income section labels", () => {
    renderActivityIncome();

    expect(
      document.getElementById("field-activityIncome.monthlyIncome")
        ?.textContent,
    ).toContain("Renda da atividade principal informada neste bloco.");
    expect(
      screen.getByText("Adicione somente quando houver outra fonte de renda."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Adicionar outra renda" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Renda e Atividade")).toBeInTheDocument();
    expect(screen.getByText("Outras rendas")).toBeInTheDocument();
    expect(screen.getByText("Renda total declarada")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });

  it("labels the income type consistently, with a hint, and no longer offers renda mista", () => {
    renderActivityIncome();

    const field = document.getElementById("field-activityIncome.incomeSource");
    expect(field?.textContent).toContain("Tipo de renda");
    expect(field?.textContent).toContain(
      "Refere-se apenas à renda declarada neste bloco",
    );

    fireEvent.click(fieldTrigger("activityIncome.incomeSource")!);

    expect(screen.getByText("Salário")).toBeInTheDocument();
    expect(screen.queryByText("Renda mista")).not.toBeInTheDocument();
  });

  it("orders the primary income fields starting with income type", () => {
    renderActivityIncome({
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
    });

    expectFieldBefore(
      "activityIncome.incomeSource",
      "registration.activityCategories",
    );
    expectFieldBefore(
      "registration.activityCategories",
      "registration.businessActivityBranch",
    );
    expectFieldBefore(
      "registration.businessActivityBranch",
      "registration.businessActivitySubcategory",
    );
    expectFieldBefore(
      "registration.businessActivitySubcategory",
      "activityIncome.activityTime",
    );
    expectFieldBefore(
      "activityIncome.activityTime",
      "activityIncome.monthlyIncome",
    );
  });

  it("places family relationship immediately after the secondary income type", () => {
    renderActivityIncome(undefined, {
      additionalIncomes: [
        {
          id: 1,
          activityCategories: [],
          activityCategoryOther: "",
          occupation: "",
          businessActivityBranch: "",
          businessActivitySubcategory: "",
          activityTime: "",
          source: IncomeSource.FAMILY_INCOME,
          amount: "",
          familyRelationship: "",
        },
      ],
    });

    expectFieldBefore(
      "activityIncome.additionalIncomes.0.source",
      "activityIncome.additionalIncomes.0.familyRelationship",
    );
    expectFieldBefore(
      "activityIncome.additionalIncomes.0.familyRelationship",
      "activityIncome.additionalIncomes.0.activityCategories",
    );
    expectFieldBefore(
      "activityIncome.additionalIncomes.0.activityCategories",
      "activityIncome.additionalIncomes.0.businessActivityBranch",
    );
  });

  it("updates the declared income total in real time", () => {
    renderActivityIncome();

    fireEvent.change(fieldInput("activityIncome.monthlyIncome")!, {
      target: { value: "100000" },
    });
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Adicionar outra renda" }),
    );
    fireEvent.change(fieldInput("activityIncome.additionalIncomes.0.amount")!, {
      target: { value: "50000" },
    });

    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
  });

  it.each([
    EconomicActivityCategory.CLT_EMPLOYEE,
    EconomicActivityCategory.PUBLIC_SERVANT,
    EconomicActivityCategory.RETIRED_OR_PENSIONER,
    EconomicActivityCategory.UNEMPLOYED,
  ])("shows profissão when atividade econômica is %s", (category) => {
    renderActivityIncome({ activityCategories: [category] });

    expect(fieldInput("registration.occupation")).toBeTruthy();
    expectFieldBefore(
      "registration.activityCategories",
      "registration.occupation",
    );
  });

  it.each([
    EconomicActivityCategory.CLT_EMPLOYEE,
    EconomicActivityCategory.PUBLIC_SERVANT,
    EconomicActivityCategory.RETIRED_OR_PENSIONER,
    EconomicActivityCategory.UNEMPLOYED,
  ])(
    "hides ramo de atividade and subcategoria when atividade econômica is %s — não tem negócio próprio",
    (category) => {
      renderActivityIncome({
        activityCategories: [category],
        businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
        businessActivitySubcategory:
          BusinessActivitySubcategory.GENERAL_COMMERCE,
      });

      expect(
        document.getElementById("field-registration.businessActivityBranch"),
      ).toBeNull();
      expect(
        document.getElementById(
          "field-registration.businessActivitySubcategory",
        ),
      ).toBeNull();
    },
  );

  it.each([
    EconomicActivityCategory.BUSINESS_OWNER,
    EconomicActivityCategory.SELF_EMPLOYED_OR_INFORMAL,
    EconomicActivityCategory.OTHER,
  ])(
    "keeps ramo de atividade required when atividade econômica is %s",
    (category) => {
      renderActivityIncome({ activityCategories: [category] });

      expect(fieldTrigger("registration.businessActivityBranch")).toBeTruthy();
    },
  );

  it("clears ramo de atividade and subcategoria when switching to a category that doesn't need them", () => {
    renderActivityIncome({
      activityCategories: [EconomicActivityCategory.BUSINESS_OWNER],
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
      businessActivitySubcategory: BusinessActivitySubcategory.GENERAL_COMMERCE,
    });

    expect(fieldTrigger("registration.businessActivityBranch")).toBeTruthy();

    fireEvent.click(fieldTrigger("registration.activityCategories")!);
    fireEvent.click(screen.getByText("Empregado CLT"));

    expect(
      document.getElementById("field-registration.businessActivityBranch"),
    ).toBeNull();
  });

  it.each([
    EconomicActivityCategory.BUSINESS_OWNER,
    EconomicActivityCategory.SELF_EMPLOYED_OR_INFORMAL,
  ])(
    "hides profissão when atividade econômica is %s — subcategoria já descreve a atividade",
    (category) => {
      renderActivityIncome({ activityCategories: [category] });

      expect(
        document.getElementById("field-registration.occupation"),
      ).toBeNull();
    },
  );

  it("shows the subcategory, scoped to the selected branch, once a ramo de atividade is chosen", () => {
    renderActivityIncome({
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
    });

    expect(
      fieldTrigger("registration.businessActivitySubcategory"),
    ).toBeTruthy();
  });

  it("resets the subcategory when it no longer belongs to the new ramo de atividade", () => {
    renderActivityIncome({
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
      businessActivitySubcategory: BusinessActivitySubcategory.GENERAL_COMMERCE,
    });

    expect(
      fieldTrigger("registration.businessActivitySubcategory")?.textContent,
    ).toContain("Comércio Geral");

    fireEvent.click(fieldTrigger("registration.businessActivityBranch")!);
    fireEvent.click(screen.getByText("Alimentação"));

    expect(
      fieldTrigger("registration.businessActivitySubcategory")?.textContent,
    ).toBe("Selecione");
  });

  it("keeps the subcategory selected when Outro is still valid for the new branch", () => {
    renderActivityIncome({
      businessActivityBranch: BusinessActivityBranch.RETAIL_COMMERCE,
      businessActivitySubcategory: BusinessActivitySubcategory.OTHER,
    });

    fireEvent.click(fieldTrigger("registration.businessActivityBranch")!);
    fireEvent.click(screen.getByText("Alimentação"));

    expect(
      fieldTrigger("registration.businessActivitySubcategory")?.textContent,
    ).toContain("Outro");
  });

  it("shows the subcategory for branches other than Comércio / Varejo too", () => {
    renderActivityIncome({
      businessActivityBranch: BusinessActivityBranch.CONSTRUCTION,
    });

    expect(
      fieldTrigger("registration.businessActivitySubcategory"),
    ).toBeTruthy();
  });

  it("shows the activity-other field only when atividade econômica is Outros", () => {
    renderActivityIncome({
      activityCategories: [EconomicActivityCategory.OTHER],
    });

    expect(fieldInput("registration.activityCategoryOther")).toBeTruthy();
    expectFieldBefore(
      "registration.activityCategories",
      "registration.activityCategoryOther",
    );
    expectFieldBefore(
      "registration.activityCategoryOther",
      "registration.businessActivityBranch",
    );
  });
});
