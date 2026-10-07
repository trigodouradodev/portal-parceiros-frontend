import { renderWithProviders, testUser } from "@/test/render";
import { useForm } from "react-hook-form";
import { fireEvent, screen } from "@testing-library/react";
import { vi, beforeEach, describe, expect, it } from "vitest";
import { Form } from "@/components/ui/form";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { DocumentsSection } from "@/features/originacao/components/proposta/DocumentsSection";
import { useQuoteAttachments } from "@/features/originacao/hooks/useQuoteDocumentation";

vi.mock("@/features/originacao/hooks/useQuoteDocumentation", () => ({
  useQuoteAttachments: vi.fn(),
  useUploadQuoteAttachment: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRemoveQuoteAttachment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock("@/contexts/toast/toast-context", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

function renderDocuments(required: boolean, threshold = 2000) {
  vi.mocked(useQuoteAttachments).mockReturnValue({
    data: {
      identificationDocuments: [],
      proofOfResidence: [],
      activityPhotos: [],
      proofOfIncome: [],
      incomeProofRequired: required,
    },
    isSuccess: true,
    isError: false,
    isLoading: false,
    isFetching: false,
  } as unknown as ReturnType<typeof useQuoteAttachments>);
  function Harness() {
    const form = useForm<ProposalFormData>({
      defaultValues: createEmptyProposalForm(),
    });
    return (
      <Form {...form}>
        <DocumentsSection quoteId="quote-id" />
      </Form>
    );
  }
  return renderWithProviders(<Harness />, {
    auth: { user: { ...testUser, quoteIncomeProofRequiredAbove: threshold } },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("DocumentsSection", () => {
  it("mostra fotos da atividade como opcionais, sem asterisco", () => {
    renderDocuments(true);
    const field = document.getElementById("field-documents.activityPhotos");
    expect(field?.textContent).toContain("Opcional");
    expect(field?.textContent).not.toContain("*");
  });
  it("exibe etiqueta e orientação de comprovante opcional", () => {
    renderDocuments(false);
    expect(
      document.getElementById("field-documents.incomeProofs")?.textContent,
    ).toContain("Opcional");
    expect(
      screen.getByText(
        "Opcional para propostas de até R$ 2.000,00. Se o cliente tiver, anexe.",
      ),
    ).toBeInTheDocument();
    expect(
      document.getElementById("field-documents.incomeProofs")?.textContent,
    ).not.toContain("*");
  });

  it("exibe a orientação obrigatória e acompanha o limite configurado", () => {
    renderDocuments(true, 3500);
    expect(
      screen.getByText("Obrigatório para propostas acima de R$ 3.500,00."),
    ).toBeInTheDocument();
    expect(
      document.getElementById("field-documents.incomeProofs")?.textContent,
    ).not.toContain("Opcional");
    expect(
      document.getElementById("field-documents.incomeProofs")?.textContent,
    ).toContain("*");
  });

  it("habilita o anexo somente depois de escolher o tipo e aplica seus formatos", () => {
    renderDocuments(false);
    const input = document
      .getElementById("field-documents.incomeProofs")
      ?.querySelector("input[type=file]");
    const uploadButton = screen.getByRole("button", {
      name: "Anexar comprovantes",
    });
    expect(input).toBeDisabled();
    expect(uploadButton).toBeDisabled();
    expect(
      screen.getByText(
        "Selecione o tipo de comprovante para habilitar o anexo.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Holerite" }));
    expect(input).toBeEnabled();
    expect(uploadButton).toBeEnabled();
    expect(input?.getAttribute("accept")).toContain("image/jpeg");
    expect(input?.getAttribute("accept")).toContain("image/png");
    fireEvent.click(screen.getByRole("button", { name: "Holerite" }));
    expect(input).toBeDisabled();
    expect(uploadButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Extrato bancário" }));
    expect(input).toBeEnabled();
    expect(uploadButton).toBeEnabled();
    expect(input).toHaveAttribute("accept", ".pdf,application/pdf");
  });
});
