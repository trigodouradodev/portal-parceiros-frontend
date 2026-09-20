import { useForm } from "react-hook-form";
import { render } from "@testing-library/react";
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
  it("groups atividade econômica, profissão, ramo de atividade and tempo na atividade, hiding the subcategory and the activity-other field by default", () => {
    renderActivityIncome();

    expect(fieldTrigger("registration.activityCategories")).toBeTruthy();
    expect(fieldInput("registration.occupation")).toBeTruthy();
    expect(fieldTrigger("registration.businessActivityBranch")).toBeTruthy();
    expect(fieldTrigger("activityIncome.activityTime")).toBeTruthy();
    expect(
      document.getElementById("field-registration.businessActivitySubcategory"),
    ).toBeNull();
    expect(
      document.getElementById("field-registration.activityCategoryOther"),
    ).toBeNull();
  });

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
