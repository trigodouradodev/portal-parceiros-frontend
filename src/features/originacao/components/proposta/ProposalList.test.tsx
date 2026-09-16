import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { ProposalList } from "@/features/originacao/components/proposta/ProposalList";
import { quotesService } from "@/services/quotes/quotes.service";
import type { QuoteListItem } from "@/services/quotes/quotes.types";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import { renderWithProviders } from "@/test/render";

vi.mock("@/services/quotes/quotes.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/quotes/quotes.service")
  >("@/services/quotes/quotes.service");
  return {
    ...actual,
    quotesService: {
      ...actual.quotesService,
      list: vi.fn(),
    },
  };
});

const list = vi.mocked(quotesService.list);

function item(overrides: Partial<QuoteListItem> = {}): QuoteListItem {
  return {
    id: "quote-1",
    simulationId: "sim-1",
    status: QuoteStatus.DRAFT,
    name: "Maria Silva",
    document: "52998224725",
    productId: "prod-1",
    productName: "Crédito Pessoal",
    financeAmount: 1500,
    consultant: { id: "user-1", name: "Parceiro" },
    completedSteps: [],
    canEdit: true,
    createdAt: "2026-09-03T12:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z",
    ...overrides,
  };
}

function pageOf(items: QuoteListItem[]) {
  return {
    items,
    pagination: {
      page: 1,
      limit: 30,
      total: items.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
}

function renderList(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithProviders(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("ProposalList", () => {
  beforeEach(() => {
    list.mockReset();
    vi.stubEnv("VITE_BACKOFFICE_URL", "https://backoffice.example.com");
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("labels client_review as revisão do cliente, not concluída", async () => {
    list.mockResolvedValue(
      pageOf([item({ status: QuoteStatus.CLIENT_REVIEW, canEdit: false })]),
    );

    renderList(<ProposalList onOpen={vi.fn()} />);

    expect(await screen.findByText("Revisão do cliente")).toBeInTheDocument();
    expect(screen.queryByText("Concluída")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Acompanhar proposta" }),
    ).toBeInTheDocument();
  });

  it("opens the backoffice when following a proposal in client review", async () => {
    const onOpen = vi.fn();
    list.mockResolvedValue(
      pageOf([
        item({
          id: "quote-review",
          status: QuoteStatus.CLIENT_REVIEW,
          canEdit: false,
        }),
      ]),
    );

    renderList(<ProposalList onOpen={onOpen} />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Acompanhar proposta" }),
    );

    expect(window.open).toHaveBeenCalledWith(
      "https://backoffice.example.com/credit-analysis/quotes/quote-review",
      "_blank",
      "noopener,noreferrer",
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("opens the backoffice when the proposal has left client review", async () => {
    const onOpen = vi.fn();
    list.mockResolvedValue(
      pageOf([
        item({
          id: "quote-kyc",
          status: QuoteStatus.KYC_ANALYSIS,
          canEdit: false,
        }),
      ]),
    );

    renderList(<ProposalList onOpen={onOpen} />);

    expect(await screen.findByText("Validação automática")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver proposta" }));

    expect(window.open).toHaveBeenCalledWith(
      "https://backoffice.example.com/credit-analysis/quotes/quote-kyc",
      "_blank",
      "noopener,noreferrer",
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("applies backoffice-aligned colors on the status badge", async () => {
    list.mockResolvedValue(
      pageOf([
        item({ id: "draft", status: QuoteStatus.DRAFT }),
        item({
          id: "analysis",
          status: QuoteStatus.IN_ANALYSIS,
          canEdit: false,
        }),
        item({
          id: "approved",
          status: QuoteStatus.APPROVED,
          canEdit: false,
        }),
        item({
          id: "rejected",
          status: QuoteStatus.REJECTED,
          canEdit: false,
        }),
      ]),
    );

    renderList(<ProposalList onOpen={vi.fn()} />);

    expect(await screen.findByText("Rascunho")).toHaveClass(
      "bg-brand-yellow",
      "text-brand-navy",
    );
    expect(screen.getByText("Em análise")).toHaveClass(
      "bg-brand-navy",
      "text-white",
    );
    expect(screen.getByText("Aprovada")).toHaveClass("bg-success-bg");
    expect(screen.getByText("Rejeitada")).toHaveClass("bg-destructive");
  });
});
