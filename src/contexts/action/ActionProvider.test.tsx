import { useState, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionProvider } from "@/contexts/action/ActionProvider";
import { useActionContext } from "@/contexts/action/action-context";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/auth/auth-context";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import { testUser } from "@/test/render";
import type { UserProfile } from "@/services/auth/types";

const otherUser: UserProfile = {
  ...testUser,
  id: "user-2",
  email: "ianca@test.com",
  full_name: "Ianca",
};

function Probe() {
  const { client, setActionData } = useActionContext();

  return (
    <div>
      <p>{client ? `cliente:${client.name}` : "sem-cliente"}</p>
      <button
        type="button"
        onClick={() =>
          setActionData({
            client: {
              id: "c1",
              installmentNumber: 1,
              name: "Cliente A",
              contract: "CT-1",
              parcela: "1",
              value: "100",
              currentStep: "contato",
              daysInfo: "hoje",
            },
            mode: TaskTab.Charge,
            onComplete: () => {},
          })
        }
      >
        set-action
      </button>
    </div>
  );
}

function Harness({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(testUser);
  const value: AuthContextType = {
    user,
    accessToken: user ? "access" : null,
    refreshToken: user ? "refresh" : null,
    loading: false,
    authenticated: !!user,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  };

  return (
    <AuthContext.Provider value={value}>
      <button type="button" onClick={() => setUser(otherUser)}>
        switch-user
      </button>
      <button type="button" onClick={() => setUser(null)}>
        logout
      </button>
      {children}
    </AuthContext.Provider>
  );
}

describe("ActionProvider", () => {
  it("clears action data when the authenticated user changes", async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <ActionProvider>
          <Probe />
        </ActionProvider>
      </Harness>,
    );

    await user.click(screen.getByRole("button", { name: "set-action" }));
    expect(screen.getByText("cliente:Cliente A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "switch-user" }));
    expect(screen.getByText("sem-cliente")).toBeInTheDocument();
  });

  it("clears action data on logout", async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <ActionProvider>
          <Probe />
        </ActionProvider>
      </Harness>,
    );

    await user.click(screen.getByRole("button", { name: "set-action" }));
    expect(screen.getByText("cliente:Cliente A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "logout" }));
    expect(screen.getByText("sem-cliente")).toBeInTheDocument();
  });
});
