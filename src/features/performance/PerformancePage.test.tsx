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
  performanceService: {
    getMonths: vi.fn(),
    getPerformance: vi.fn(),
    getPartners: vi.fn(),
    getTeam: vi.fn(),
  },
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
async function selectMonth(currentLabel: string, nextLabel: string) {
  await userEvent.click(
    await screen.findByRole("button", { name: currentLabel }),
  );
  await userEvent.click(
    within(
      screen.getByRole("dialog", { name: "Selecionar competência" }),
    ).getByRole("button", { name: nextLabel }),
  );
}
async function selectSeptember() {
  await selectMonth("Outubro - 2026", "Setembro - 2026");
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
  vi.mocked(performanceService.getPartners).mockResolvedValue([
    { id: testUser.id, name: testUser.full_name },
  ]);
  vi.mocked(performanceService.getTeam).mockImplementation(
    async (partnerId) => [
      {
        id: partnerId,
        name: partnerId === testUser.id ? testUser.full_name : "Bruno Parceiro",
      },
    ],
  );
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
    expect(
      screen.getByRole("button", { name: "Outubro - 2026" }),
    ).toBeVisible();
    expect(getPerformance).toHaveBeenCalledWith(
      "2026-10",
      expect.any(AbortSignal),
      testUser.id,
      undefined,
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
    await selectSeptember();
    expect(await screen.findByText("Nível Bronze")).toBeVisible();
    await selectMonth("Setembro - 2026", "Outubro - 2026");
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
    expect(
      screen.getByRole("button", { name: "Outubro - 2026" }),
    ).toBeVisible();
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
    expect(
      await screen.findByRole("button", { name: "Outubro - 2026" }),
    ).toBeVisible();
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
    await userEvent.click(
      screen.getByRole("button", { name: "Outubro - 2026" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Selecionar competência",
    });
    expect(
      within(dialog).getByRole("button", { name: "Outubro - 2026" }),
    ).toBeVisible();
    expect(
      within(dialog).queryByRole("button", { name: "Setembro - 2026" }),
    ).not.toBeInTheDocument();
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
    getPerformance.mockResolvedValue(testPerformanceData);
    await selectSeptember();
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
    vi.mocked(performanceService.getPartners).mockResolvedValue([
      { id: "user-2", name: "Outro Parceiro" },
    ]);
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
  expect(screen.getByRole("button", { name: "Outubro - 2026" })).toBeVisible();
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

const ownerId = "f630bd84-1425-423a-a533-5e5139abb9d5";
const memberId = "adb77ae3-7fda-4b87-856e-9583f4d90d0c";
const otherOwnerId = "3a49631e-73ae-4b1e-acbe-d41ab05755eb";
async function chooseOption(trigger: string, dialog: string, option: string) {
  await userEvent.click(await screen.findByRole("button", { name: trigger }));
  await userEvent.click(
    within(screen.getByRole("dialog", { name: dialog })).getByRole("button", {
      name: option,
    }),
  );
}
function individualResponse(missingDetails = false): PerformanceResponse {
  const response = structuredClone(testPerformanceData);
  response.month = "2026-10";
  response.view = {
    mode: "INDIVIDUAL",
    portfolioReference: missingDetails ? null : "2026-10-20",
    missingDetails,
  };
  response.data.level = { key: "UNKNOWN", label: null };
  response.data.contractsCount = missingDetails ? 0 : 7;
  response.data.indicators.origination = {
    status: "AVAILABLE",
    amount: missingDetails ? 0 : 19200,
    targetAmount: null,
    targetPercent: null,
    appliedBand: null,
  };
  response.data.indicators.interestRate = {
    status: "AVAILABLE",
    rate: missingDetails ? 0 : 10.67,
    simpleRate: null,
    weightedRate: null,
    appliedBand: null,
  };
  response.data.indicators.delinquency = {
    status: "AVAILABLE",
    rate: null,
    portfolioRate: null,
    overdueAmount: missingDetails ? 0 : 61035.16,
    portfolioAmount: missingDetails ? 0 : 222058.82,
    disregardedOverdueAmount: null,
    disregardedPortfolioAmount: null,
    appliedBand: null,
  };
  response.data.indicators.reimbursement = {
    status: "AVAILABLE",
    amount: missingDetails ? 0 : 22832.11,
  };
  return response;
}

describe("partner and team selection", () => {
  beforeEach(() => {
    vi.mocked(performanceService.getPartners).mockResolvedValue([
      { id: ownerId, name: "Valter" },
      { id: otherOwnerId, name: "Vanderlan" },
    ]);
    vi.mocked(performanceService.getTeam).mockImplementation(
      async (partnerId) =>
        partnerId === ownerId
          ? [
              { id: ownerId, name: "Valter" },
              { id: memberId, name: "Arlete" },
            ]
          : [{ id: otherOwnerId, name: "Vanderlan" }],
    );
    getPerformance.mockImplementation(
      async (month, _signal, _partner, member) =>
        member
          ? individualResponse()
          : { ...testPerformanceData, month: month! },
    );
  });

  it("manager chooses a partner before any numbers load, then selects consolidated, owner or member", async () => {
    renderPage();
    expect(
      await screen.findByText(
        "Selecione um parceiro para acompanhar o desempenho.",
      ),
    ).toBeVisible();
    expect(getPerformance).not.toHaveBeenCalled();
    await chooseOption("Selecione o parceiro", "Selecionar parceiro", "Valter");
    expect(
      await screen.findByRole("region", { name: "Resumo da remuneração" }),
    ).toBeVisible();
    await userEvent.click(
      await screen.findByRole("button", { name: "Consolidado" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Selecionar visualização",
    });
    expect(
      within(dialog).getByRole("button", { name: "Valter — próprio" }),
    ).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Arlete" }),
    );
    await waitFor(() =>
      expect(getPerformance).toHaveBeenLastCalledWith(
        "2026-10",
        expect.any(AbortSignal),
        ownerId,
        memberId,
      ),
    );
    expect(await screen.findByText("7 contratos na competência")).toBeVisible();
    expect(card("Originação no mês").getByText(/19.200,00/)).toBeVisible();
    expect(card("Taxa média").getByText("10,67%")).toBeVisible();
    expect(card("Reembolso no mês").getByText(/22.832,11/)).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Resumo da remuneração" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Nível Bronze")).not.toBeInTheDocument();
    expect(
      screen.getByText("Referência da carteira: 20/10/2026."),
    ).toBeVisible();
    expect(
      screen.queryByText(/Posição diária com base em D-1/),
    ).not.toBeInTheDocument();
    await chooseOption("Arlete", "Selecionar visualização", "Consolidado");
    expect(
      await screen.findByRole("region", { name: "Resumo da remuneração" }),
    ).toBeVisible();
  });

  it.each([null, undefined, 0])(
    "preserves the individual contract count %s without replacing missing counts with zero",
    async (count) => {
      const response = individualResponse();
      if (response.availability !== "AVAILABLE") throw new Error("fixture");
      response.data.contractsCount = count;
      getPerformance.mockImplementation(
        async (month, _signal, _partner, member) =>
          member ? response : { ...testPerformanceData, month: month! },
      );
      renderPage();
      await chooseOption(
        "Selecione o parceiro",
        "Selecionar parceiro",
        "Valter",
      );
      await chooseOption("Consolidado", "Selecionar visualização", "Arlete");
      expect(
        await screen.findByText("19.200,00", { exact: false }),
      ).toBeVisible();
      const origination = card("Originação no mês");
      if (count == null) {
        expect(
          origination.queryByText(/contratos na competência/),
        ).not.toBeInTheDocument();
      } else {
        expect(
          origination.getByText("0 contratos na competência"),
        ).toBeVisible();
      }
    },
  );

  it("resets the individual view when switching partner and hides the team selector without a team", async () => {
    renderPage();
    await chooseOption("Selecione o parceiro", "Selecionar parceiro", "Valter");
    await chooseOption("Consolidado", "Selecionar visualização", "Arlete");
    expect(await screen.findByText("7 contratos na competência")).toBeVisible();
    await chooseOption("Valter", "Selecionar parceiro", "Vanderlan");
    expect(
      await screen.findByRole("region", { name: "Resumo da remuneração" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Consolidado" }),
    ).not.toBeInTheDocument();
    expect(getPerformance).toHaveBeenLastCalledWith(
      "2026-10",
      expect.any(AbortSignal),
      otherOwnerId,
      undefined,
    );
  });

  it("shows zeros and explains missing individual details instead of showing the owner's remuneration", async () => {
    getPerformance.mockResolvedValue(individualResponse(true));
    renderPage();
    await chooseOption("Selecione o parceiro", "Selecionar parceiro", "Valter");
    await chooseOption("Consolidado", "Selecionar visualização", "Arlete");
    expect(
      await screen.findByText(/Detalhamento ainda não disponível/),
    ).toBeVisible();
    expect(card("Originação no mês").getByText(/0,00/)).toBeVisible();
    expect(
      card("Originação no mês").getByText("0 contratos na competência"),
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Resumo da remuneração" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the previous person's values off screen while another member is loading", async () => {
    getPerformance.mockImplementation((month, _signal, _partner, member) =>
      member
        ? new Promise(() => {})
        : Promise.resolve({ ...testPerformanceData, month: month! }),
    );
    renderPage();
    await chooseOption("Selecione o parceiro", "Selecionar parceiro", "Valter");
    expect(await screen.findByText("Nível Bronze")).toBeVisible();
    await chooseOption("Consolidado", "Selecionar visualização", "Arlete");
    expect(
      screen.getByRole("status", { name: "Carregando dados da competência" }),
    ).toBeVisible();
    expect(screen.queryByText("Nível Bronze")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Resumo da remuneração" }),
    ).not.toBeInTheDocument();
  });

  it("hides both people selectors for the authenticated partner without a team", async () => {
    vi.mocked(performanceService.getPartners).mockResolvedValue([
      { id: testUser.id, name: testUser.full_name },
    ]);
    vi.mocked(performanceService.getTeam).mockResolvedValue([
      { id: testUser.id, name: testUser.full_name },
    ]);
    renderPage();
    expect(
      await screen.findByRole("region", { name: "Resumo da remuneração" }),
    ).toBeVisible();
    expect(
      screen.queryByText("Parceiro", { selector: "label" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Consolidado" }),
    ).not.toBeInTheDocument();
  });
});
