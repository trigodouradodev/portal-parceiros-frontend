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
  EconomicActivityCategory,
} from "@/services/quotes/quotes.enums";

function renderActivityIncome(
  registrationOverrides: Partial<ProposalFormData["registration"]> = {},
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

  it("shows explanatory hints for renda mensal and múltiplas fontes", () => {
    renderActivityIncome();

    expect(
      document.getElementById("field-activityIncome.monthlyIncome")
        ?.textContent,
    ).toContain("Renda da atividade principal informada nesta tela.");
    expect(
      document.getElementById("field-activityIncome.hasMultipleSources")
        ?.textContent,
    ).toContain("Considere renda além da atividade principal");
  });

  it("labels a fonte principal da renda, with a hint, and no longer offers renda mista", () => {
    renderActivityIncome();

    const field = document.getElementById("field-activityIncome.incomeSource");
    expect(field?.textContent).toContain("Fonte principal da renda declarada");
    expect(field?.textContent).toContain(
      "Refere-se apenas à renda declarada acima",
    );

    fireEvent.click(fieldTrigger("activityIncome.incomeSource")!);

    expect(screen.getByText("Salário")).toBeInTheDocument();
    expect(screen.queryByText("Renda mista")).not.toBeInTheDocument();
  });

  it.each([
    EconomicActivityCategory.CLT_EMPLOYEE,
    EconomicActivityCategory.PUBLIC_SERVANT,
    EconomicActivityCategory.RETIRED_OR_PENSIONER,
    EconomicActivityCategory.UNEMPLOYED,
  ])("shows profissão when atividade econômica is %s", (category) => {
    renderActivityIncome({ activityCategories: [category] });

    expect(fieldInput("registration.occupation")).toBeTruthy();
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
  });
});
