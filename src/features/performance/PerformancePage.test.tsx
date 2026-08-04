import { AxiosError } from "axios";
import { screen } from "@testing-library/react";
import { PerformancePage } from "@/features/performance/PerformancePage";
import {
  useCurrentPerformance,
  usePartnerProfile,
  usePartnerProgram,
} from "@/hooks/usePerformanceData";
import {
  testLevel,
  testProgram,
} from "@/test/fixtures/performance";
import { renderWithProviders } from "@/test/render";
import {
  CommissionComponentKind,
  type CurrentPerformance,
  type PartnerProfile,
} from "@/services/performance/performance.types";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useOutletContext: () => ({ onMobileLogout: vi.fn() }),
  };
});

vi.mock("@/hooks/usePerformanceData", async () => {
  const actual = await vi.importActual<
    typeof import("@/hooks/usePerformanceData")
  >("@/hooks/usePerformanceData");
  return {
    ...actual,
    usePartnerProfile: vi.fn(),
    usePartnerProgram: vi.fn(),
    useCurrentPerformance: vi.fn(),
  };
});

const mockedUsePartnerProfile = vi.mocked(usePartnerProfile);
const mockedUsePartnerProgram = vi.mocked(usePartnerProgram);
const mockedUseCurrentPerformance = vi.mocked(useCurrentPerformance);

function pendingQuery() {
  return {
    isPending: true,
    isError: false,
    data: undefined,
    error: null,
  } as ReturnType<typeof usePartnerProfile>;
}

function errorQuery(error: unknown) {
  return {
    isPending: false,
    isError: true,
    data: undefined,
    error,
  } as ReturnType<typeof usePartnerProfile>;
}

function successQuery<T>(data: T) {
  return {
    isPending: false,
    isError: false,
    data,
    error: null,
  } as ReturnType<typeof usePartnerProfile> & { data: T };
}

function notFoundError() {
  return new AxiosError(
    "Not Found",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 404,
      data: { message: "Not enrolled" },
      statusText: "Not Found",
      headers: {},
      config: { headers: {} as never },
    },
  );
}

const profile: PartnerProfile = {
  partner: {
    id: "p1",
    fullName: "Ana Parceira",
    roleLabel: "Consultor",
  },
  level: testLevel,
  partnership: {
    startedAt: "2025-01-15",
    monthNumber: 3,
    isFirstMonth: false,
    nextMilestone: null,
  },
};

const current: CurrentPerformance = {
  month: "2026-03",
  periodStart: "2026-03-01",
  periodEnd: "2026-03-31",
  origination: {
    count: 10,
    amount: 90_000,
    targetPercent: 90,
    bonusPercent: 10,
  },
  delinquency: {
    rate: 1.5,
    overdueAmount: 1000,
    portfolioOpenAmount: 50_000,
    bonusPercent: 20,
  },
  averageRate: {
    rate: 9.5,
    bonusPercent: 10,
  },
  commission: {
    total: 2800,
    components: [
      { kind: CommissionComponentKind.FIXED, amount: 2000 },
      { kind: CommissionComponentKind.DISBURSEMENT_BONUS, amount: 200 },
      { kind: CommissionComponentKind.RISK_BONUS, amount: 400 },
      { kind: CommissionComponentKind.RATE_BONUS, amount: 200 },
    ],
  },
};

describe("PerformancePage", () => {
  beforeEach(() => {
    mockedUsePartnerProfile.mockReturnValue(pendingQuery());
    mockedUsePartnerProgram.mockReturnValue(pendingQuery());
    mockedUseCurrentPerformance.mockReturnValue(pendingQuery());
  });

  it("shows skeleton while profile is loading", () => {
    renderWithProviders(<PerformancePage />);
    expect(screen.getByText("Carregando desempenho...")).toBeInTheDocument();
  });

  it("shows enrollment message on profile 404", () => {
    mockedUsePartnerProfile.mockReturnValue(errorQuery(notFoundError()));
    renderWithProviders(<PerformancePage />);
    expect(
      screen.getByText(
        "Você ainda não participa do Programa de Parceiros Exclusivos.",
      ),
    ).toBeInTheDocument();
  });

  it("shows API error message on profile failure", () => {
    mockedUsePartnerProfile.mockReturnValue(
      errorQuery(
        new AxiosError("Boom", "ERR_BAD_REQUEST", undefined, undefined, {
          status: 500,
          data: { message: "Falha no servidor" },
          statusText: "Error",
          headers: {},
          config: { headers: {} as never },
        }),
      ),
    );
    renderWithProviders(<PerformancePage />);
    expect(screen.getByText("Falha no servidor")).toBeInTheDocument();
  });

  it("renders performance content when enrolled and data is ready", () => {
    mockedUsePartnerProfile.mockReturnValue(successQuery(profile));
    mockedUsePartnerProgram.mockReturnValue(successQuery(testProgram));
    mockedUseCurrentPerformance.mockReturnValue(successQuery(current));

    renderWithProviders(<PerformancePage />);

    expect(screen.getByText("Ana Parceira")).toBeInTheDocument();
    expect(screen.getAllByText(/Nível\s*Ouro/).length).toBeGreaterThan(0);
    expect(screen.getByText("Desempenho real do mês")).toBeInTheDocument();
    expect(screen.getByText("Simulador de cenários")).toBeInTheDocument();
  });
});
