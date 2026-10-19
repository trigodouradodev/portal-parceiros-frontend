import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PerformancePage } from "./PerformancePage";
import { performanceService } from "@/services/performance/performance.service";
import type { PerformanceResponse } from "@/services/performance/performance.types";
import {
  testPerformanceMonths,
  testPerformanceData,
} from "@/test/fixtures/performance";
import { renderWithProviders, testUser } from "@/test/render";

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  )),
  useOutletContext: () => ({ onMobileLogout: vi.fn() }),
}));
vi.mock("@/services/performance/performance.service", () => ({
  performanceService: { getMonths: vi.fn(), getPerformance: vi.fn() },
}));
const getMonths = vi.mocked(performanceService.getMonths);
const getPerformance = vi.mocked(performanceService.getPerformance);

let desktopLayout = true;
const layoutListeners = new Set<() => void>();

function changeLayout(isDesktop: boolean) {
  desktopLayout = isDesktop;
  layoutListeners.forEach((listener) => listener());
}

function remunerationRow(label: string) {
  const term = within(
    screen.getByRole("region", { name: "Resumo da remuneração" }),
  ).getByText(label, { selector: "dt" });
  return within(term.parentElement!);
}

function renderPage(client = new QueryClient(), user = testUser) {
  return renderWithProviders(
    <QueryClientProvider client={client}>
      <PerformancePage />
    </QueryClientProvider>,
    { auth: { user } },
  );
}
function card(label: string) {
  return within(
    screen.getByRole("heading", { name: label }).closest("article")!,
  );
}
async function selectSeptember() {
  const selector = await screen.findByRole("combobox", { name: "Competência" });
  await userEvent.selectOptions(selector, "2026-09");
  return selector;
}

beforeEach(() => {
  vi.resetAllMocks();
  desktopLayout = true;
  layoutListeners.clear();
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    get matches() {
      return desktopLayout;
    },
    addEventListener: (_event: string, listener: () => void) =>
      layoutListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) =>
      layoutListeners.delete(listener),
  }));
  getMonths.mockResolvedValue(testPerformanceMonths);
  getPerformance.mockImplementation(async (month) =>
    month === "2026-09"
      ? testPerformanceData
      : { month: month!, availability: "NO_DATA", data: null },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PerformancePage view data", () => {
  it("keeps the current month without silently replacing it with history", async () => {
    renderPage();
    expect(
      await screen.findByText(
        "Dados ainda não disponíveis para esta competência",
      ),
    ).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Competência" })).toHaveValue(
      "2026-10",
    );
    expect(getPerformance).toHaveBeenCalledWith(
      "2026-10",
      expect.any(AbortSignal),
    );
    expect(getPerformance).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/não participa/)).not.toBeInTheDocument();
  });

  it("shows official historical values and remuneration without the simulator", async () => {
    renderPage();
    await selectSeptember();
    expect(await screen.findByText("Nível Bronze")).toBeVisible();
    expect(screen.getByText("Ana Parceira")).toBeVisible();
    expect(
      card("Originação no mês").getByText("110,00% da meta"),
    ).toBeVisible();
    expect(card("Taxa média").getByText("9,50%")).toBeVisible();
    expect(card("Inadimplência").getByText("3,33%")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Desempenho" })).toBeVisible();
    expect(
      screen
        .getAllByRole("article")
        .map((article) => within(article).getByRole("heading").textContent),
    ).toEqual(["Originação no mês", "Taxa média", "Inadimplência"]);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "110,00% da meta",
    );
    expect(
      screen.getByText("Mês completo", { selector: "span" }),
    ).toBeVisible();
    expect(
      screen.queryByText(/Atualizado em|Referência da carteira/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Simulador|Quanto ganharia|Permanência/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    const remuneration = within(
      screen.getByRole("region", { name: "Resumo da remuneração" }),
    );
    expect(remuneration.getByText(/6\.120,00/)).toBeVisible();
    expect(remunerationRow("Fixo mensal").getByText(/4\.000,00/)).toBeVisible();
    expect(
      remunerationRow("Bônus de desembolso").getByText(/400,00/),
    ).toBeVisible();
    expect(
      remuneration.queryByText(/Bônus de produção|Bônus de reembolso/),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Detalhes dos indicadores"));
    expect(screen.getByText("9,70%")).toBeVisible();
    expect(screen.getByText("6,00%")).toBeVisible();
  });

  it("does not keep a previous month on screen while another month loads", async () => {
    let resolveOctober!: (response: PerformanceResponse) => void;
    getPerformance.mockImplementation((month) =>
      month === "2026-09"
        ? Promise.resolve(testPerformanceData)
        : new Promise((resolve) => {
            resolveOctober = resolve;
          }),
    );
    renderPage();
    const selector = await selectSeptember();
    expect(await screen.findByText("Nível Bronze")).toBeVisible();
    await userEvent.selectOptions(selector, "2026-10");
    expect(
      screen.getByRole("status", { name: "Carregando dados da competência" }),
    ).toBeVisible();
    expect(screen.queryByText("Nível Bronze")).not.toBeInTheDocument();
    await act(async () => {
      resolveOctober({ month: "2026-10", availability: "NO_DATA", data: null });
    });
    expect(
      await screen.findByText(
        "Dados ainda não disponíveis para esta competência",
      ),
    ).toBeVisible();
  });

  it("keeps the selector after a failed consultation and retries the selected month", async () => {
    getPerformance.mockRejectedValueOnce(
      new Error("performance_data_unavailable"),
    );
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o desempenho",
    );
    expect(
      screen.queryByText("Dados ainda não disponíveis para esta competência"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("2026-10");
    await userEvent.click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );
    expect(
      await screen.findByText(
        "Dados ainda não disponíveis para esta competência",
      ),
    ).toBeVisible();
    expect(getPerformance).toHaveBeenCalledTimes(2);
  });

  it("retries a failed month list", async () => {
    getMonths.mockRejectedValueOnce(new Error("unavailable"));
    renderPage();
    await userEvent.click(
      await screen.findByRole("button", { name: "Tentar novamente" }),
    );
    expect(await screen.findByRole("combobox")).toHaveValue("2026-10");
    expect(getMonths).toHaveBeenCalledTimes(2);
  });

  it("supports an empty history", async () => {
    getMonths.mockResolvedValue({ currentMonth: "2026-10", months: [] });
    renderPage();
    expect(
      await screen.findByText(
        "Dados ainda não disponíveis para esta competência",
      ),
    ).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("shows the current month as a daily preview without inventing a reference date", async () => {
    getMonths.mockResolvedValue({
      currentMonth: "2026-10",
      months: [{ month: "2026-10" }, { month: "2026-09" }],
    });
    getPerformance.mockResolvedValue({
      ...testPerformanceData,
      month: "2026-10",
    });
    renderPage();
    expect(
      await screen.findByText("Prévia", { selector: "span" }),
    ).toBeVisible();
    expect(
      await screen.findByText(/Posição diária com base em D-1/),
    ).toBeVisible();
    expect(
      screen.queryByText(/Atualizado em|Referência da carteira/),
    ).not.toBeInTheDocument();
    const selector = screen.getByRole("combobox");
    getPerformance.mockResolvedValue(testPerformanceData);
    await userEvent.selectOptions(selector, "2026-09");
    expect(
      await screen.findByText("Mês completo", { selector: "span" }),
    ).toBeVisible();
    expect(screen.queryByText(/Posição diária/)).not.toBeInTheDocument();
  });

  it("does not reuse cached data from another authenticated partner", async () => {
    const client = new QueryClient();
    const first = renderPage(client);
    await selectSeptember();
    expect(await screen.findByText("Nível Bronze")).toBeVisible();
    first.unmount();
    getPerformance.mockResolvedValue({
      month: "2026-10",
      availability: "NO_DATA",
      data: null,
    });
    renderPage(client, {
      ...testUser,
      id: "user-2",
      full_name: "Outro Parceiro",
    });
    expect(
      await screen.findByText(
        "Dados ainda não disponíveis para esta competência",
      ),
    ).toBeVisible();
    await waitFor(() => expect(getMonths).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Nível Bronze")).not.toBeInTheDocument();
  });
});

it("does not display a response belonging to another competence", async () => {
  getPerformance.mockResolvedValue(testPerformanceData);
  renderPage();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível carregar o desempenho",
  );
  expect(screen.getByRole("combobox")).toHaveValue("2026-10");
  expect(screen.queryByText("Nível Bronze")).not.toBeInTheDocument();
});

it("hides non-applicable indicators for a collection agent and preserves zero reimbursement", async () => {
  const response = structuredClone(testPerformanceData);
  response.month = "2026-10";
  response.data.level = { key: "COLLECTION_AGENT", label: "Cobrador" };
  response.data.indicators.origination = {
    status: "NOT_APPLICABLE",
    amount: null,
    targetAmount: null,
    targetPercent: null,
    appliedBand: null,
  };
  response.data.indicators.interestRate = {
    status: "NOT_APPLICABLE",
    rate: null,
    simpleRate: null,
    weightedRate: null,
    appliedBand: null,
  };
  response.data.indicators.delinquency = {
    status: "NOT_APPLICABLE",
    rate: null,
    portfolioRate: null,
    overdueAmount: null,
    portfolioAmount: null,
    disregardedOverdueAmount: null,
    disregardedPortfolioAmount: null,
    appliedBand: null,
  };
  response.data.indicators.reimbursement = { status: "AVAILABLE", amount: 0 };
  response.data.remuneration = {
    fixedAmount: 2500,
    disbursementBonusAmount: null,
    rateBonusAmount: null,
    riskBonusAmount: null,
    agreementAmount: null,
    productionBonusAmount: null,
    reimbursementBonusAmount: 0,
    totalAmount: 2500,
  };
  getPerformance.mockResolvedValue(response);
  renderPage();
  expect(await screen.findByText("Nível Cobrador")).toBeVisible();
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(card("Reembolso no mês").getByText(/0,00/)).toBeVisible();
  expect(
    screen.queryByText("Detalhes dos indicadores"),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

it("shows the financial values from the BI example and preserves zero components", async () => {
  const response = structuredClone(testPerformanceData);
  response.data.indicators.origination = {
    ...response.data.indicators.origination,
    amount: 80700,
    targetPercent: 80.7,
  };
  response.data.indicators.interestRate = {
    ...response.data.indicators.interestRate,
    rate: 9.83,
    simpleRate: 9.83,
    weightedRate: 9.36,
  };
  response.data.indicators.delinquency = {
    ...response.data.indicators.delinquency,
    rate: 13.11,
    portfolioRate: 13.11,
    overdueAmount: 82701.88,
    portfolioAmount: 630763.89,
    disregardedOverdueAmount: null,
    disregardedPortfolioAmount: null,
  };
  response.data.remuneration = {
    fixedAmount: 4000,
    disbursementBonusAmount: 0,
    rateBonusAmount: 800,
    riskBonusAmount: 0,
    agreementAmount: 0,
    productionBonusAmount: null,
    reimbursementBonusAmount: null,
    totalAmount: 4800,
  };
  getPerformance.mockImplementation(async (month) =>
    month === "2026-09"
      ? response
      : { month: month!, availability: "NO_DATA", data: null },
  );
  renderPage();
  await selectSeptember();
  const summary = within(
    await screen.findByRole("region", { name: "Resumo da remuneração" }),
  );
  expect(summary.getByText(/4\.800,00/)).toBeVisible();
  expect(remunerationRow("Bônus de taxa").getByText(/800,00/)).toBeVisible();
  expect(
    remunerationRow("Bônus de desembolso").getByText(/0,00/),
  ).toBeVisible();
  expect(remunerationRow("Bônus de risco").getByText(/0,00/)).toBeVisible();
  expect(remunerationRow("Acordos").getByText(/0,00/)).toBeVisible();
  expect(
    summary.queryByText(/Bônus de produção|Bônus de reembolso/),
  ).not.toBeInTheDocument();
  expect(card("Originação no mês").getByText("80,70% da meta")).toBeVisible();
  expect(card("Taxa média").getByText("9,83%")).toBeVisible();
  expect(card("Inadimplência").getByText("13,11%")).toBeVisible();
});

it("displays the official hybrid total rather than adding the two bonuses", async () => {
  const response = structuredClone(testPerformanceData);
  response.data.level = { key: "HYBRID", label: "Híbrido" };
  response.data.indicators.origination = {
    ...response.data.indicators.origination,
    targetAmount: null,
    targetPercent: null,
  };
  response.data.indicators.interestRate.status = "NOT_APPLICABLE";
  response.data.indicators.delinquency.status = "NOT_APPLICABLE";
  response.data.indicators.reimbursement = {
    status: "AVAILABLE",
    amount: 36000,
  };
  response.data.remuneration = {
    fixedAmount: null,
    disbursementBonusAmount: null,
    rateBonusAmount: null,
    riskBonusAmount: null,
    agreementAmount: null,
    productionBonusAmount: 1000,
    reimbursementBonusAmount: 1800,
    totalAmount: 1800,
  };
  getPerformance.mockImplementation(async (month) =>
    month === "2026-09"
      ? response
      : { month: month!, availability: "NO_DATA", data: null },
  );
  renderPage();
  await selectSeptember();
  const summary = within(
    await screen.findByRole("region", { name: "Resumo da remuneração" }),
  );
  expect(summary.getByText(/1\.800,00/, { selector: "p" })).toBeVisible();
  expect(
    remunerationRow("Bônus de produção").getByText(/1\.000,00/),
  ).toBeVisible();
  expect(
    remunerationRow("Bônus de reembolso").getByText(/1\.800,00/),
  ).toBeVisible();
  expect(
    summary.queryByText(
      /Fixo|Bônus de taxa|Bônus de risco|Bônus de desembolso|Acordos|2\.800,00/,
    ),
  ).not.toBeInTheDocument();
});

it.each([null, 0])(
  "preserves a total of %s without fabricating remuneration",
  async (totalAmount) => {
    const response = structuredClone(testPerformanceData);
    response.data.remuneration = {
      fixedAmount: null,
      disbursementBonusAmount: null,
      rateBonusAmount: null,
      riskBonusAmount: null,
      agreementAmount: null,
      productionBonusAmount: null,
      reimbursementBonusAmount: null,
      totalAmount,
    };
    getPerformance.mockImplementation(async (month) =>
      month === "2026-09"
        ? response
        : { month: month!, availability: "NO_DATA", data: null },
    );
    renderPage();
    await selectSeptember();
    const summary = within(
      await screen.findByRole("region", { name: "Resumo da remuneração" }),
    );
    expect(
      summary.getByText(totalAmount === null ? "N/A" : /0,00/),
    ).toBeVisible();
    expect(summary.queryByText(/Fixo|Bônus|Acordos/)).not.toBeInTheDocument();
  },
);

it("shows portfolio amounts directly without expanding indicator details", async () => {
  renderPage();
  await selectSeptember();
  const portfolio = within(
    await screen.findByRole("region", { name: "Sua carteira" }),
  );
  expect(portfolio.getByText("Carteira ativa")).toBeVisible();
  expect(portfolio.getByText(/100\.000,00/)).toBeVisible();
  expect(portfolio.getByText("Saldo em inadimplência")).toBeVisible();
  expect(portfolio.getByText(/6\.000,00/)).toBeVisible();
});

it("keeps the composition collapsed on mobile and lets the partner expand it", async () => {
  desktopLayout = false;
  renderPage();
  await selectSeptember();
  const toggle = await screen.findByRole("button", {
    name: "Composição da remuneração",
  });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(
    remunerationRow("Fixo mensal").getByText(/4\.000,00/),
  ).not.toBeVisible();
  expect(screen.getByText(/6\.120,00/)).toBeVisible();
  await userEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(remunerationRow("Fixo mensal").getByText(/4\.000,00/)).toBeVisible();
  await userEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});

it("follows layout changes before the partner explicitly toggles the composition", async () => {
  renderPage();
  await selectSeptember();
  const toggle = await screen.findByRole("button", {
    name: "Composição da remuneração",
  });
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  act(() => changeLayout(false));
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  act(() => changeLayout(true));
  expect(toggle).toHaveAttribute("aria-expanded", "true");
});

it("uses the official target percentage even when it differs from the amount ratio", async () => {
  const response = structuredClone(testPerformanceData);
  response.data.indicators.origination.targetPercent = 180.1234;
  getPerformance.mockImplementation(async (month) =>
    month === "2026-09"
      ? response
      : { month: month!, availability: "NO_DATA", data: null },
  );
  renderPage();
  await selectSeptember();
  const progress = await screen.findByRole("progressbar");
  expect(progress).toHaveAttribute("aria-valuenow", "100");
  expect(progress).toHaveAttribute("aria-valuetext", "180,12% da meta");
  expect(card("Originação no mês").getByText(/110\.000,00/)).toBeVisible();
});
