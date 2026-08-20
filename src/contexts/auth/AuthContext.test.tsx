import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { authService } from "@/services/auth/auth.service";
import type { UserProfile } from "@/services/auth/types";
import { resetQueryCache } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { useAuth } from "@/contexts/auth/auth-context";

vi.mock("@/services/auth/auth.service", () => ({
  authService: {
    login: vi.fn(),
    getProfile: vi.fn(),
  },
}));

vi.mock("@/lib/query-client", () => ({
  resetQueryCache: vi.fn(),
}));

const mockedAuth = vi.mocked(authService);
const mockedResetQueryCache = vi.mocked(resetQueryCache);

const userA: UserProfile = {
  id: "user-a",
  email: "a@test.com",
  full_name: "Usuário A",
  phone_number: null,
  role: "CONSULTANT",
  permissions: [],
  canSimulateQuote: true,
  canCreateQuote: true,
};

const userB: UserProfile = {
  ...userA,
  id: "user-b",
  email: "b@test.com",
  full_name: "Usuário B",
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider session cache", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedResetQueryCache.mockClear();
    mockedAuth.login.mockReset();
    mockedAuth.getProfile.mockReset();
  });

  it("clears the query cache after a successful login", async () => {
    mockedAuth.login.mockResolvedValue({
      user: userB,
      accessToken: "access-b",
      refreshToken: "refresh-b",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        email: "b@test.com",
        password: "senha",
      });
    });

    expect(mockedResetQueryCache).toHaveBeenCalledTimes(1);
    expect(result.current.user?.id).toBe("user-b");
  });

  it("clears the query cache on logout", async () => {
    localStorage.setItem("access_token", "access-a");
    localStorage.setItem("refresh_token", "refresh-a");
    localStorage.setItem("user", JSON.stringify(userA));
    mockedAuth.getProfile.mockResolvedValue(userA);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.authenticated).toBe(true);
    });

    mockedResetQueryCache.mockClear();

    act(() => {
      result.current.logout();
    });

    expect(mockedResetQueryCache).toHaveBeenCalledTimes(1);
    expect(result.current.authenticated).toBe(false);
  });

  it("does not clear the query cache when login fails", async () => {
    mockedAuth.login.mockRejectedValue(new Error("invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.login({ email: "b@test.com", password: "errada" }),
      ).rejects.toThrow("invalid credentials");
    });

    expect(mockedResetQueryCache).not.toHaveBeenCalled();
  });
});
