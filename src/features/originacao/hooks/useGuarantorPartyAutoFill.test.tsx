import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ToastProvider } from "@/contexts/toast/ToastContext";
import {
  createEmptyProposalForm,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { useGuarantorPartyAutoFill } from "@/features/originacao/hooks/useGuarantorPartyAutoFill";
import { partiesService } from "@/services/parties/parties.service";

vi.mock("@/services/parties/parties.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/parties/parties.service")
  >("@/services/parties/parties.service");
  return {
    ...actual,
    partiesService: {
      ...actual.partiesService,
      findFormDataByCpf: vi.fn(),
    },
  };
});

const findFormDataByCpf = vi.mocked(partiesService.findFormDataByCpf);

const REGISTERED_CPF = "00820882259";
const NEW_CPF = "33344455508";

function renderGuarantorAutoFill() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  }
  const hook = renderHook(
    () => {
      const form = useForm<ProposalFormData>({
        defaultValues: createEmptyProposalForm(),
      });
      const autoFill = useGuarantorPartyAutoFill(form.getValues, form.setValue);
      return { form, ...autoFill };
    },
    { wrapper: Wrapper },
  );
  return {
    hook,
    guarantor: () => hook.result.current.form.getValues("guarantor"),
    form: () => hook.result.current.form,
  };
}

describe("useGuarantorPartyAutoFill", () => {
  beforeEach(() => {
    findFormDataByCpf.mockReset();
    findFormDataByCpf.mockImplementation(async (digits) =>
      digits === REGISTERED_CPF
        ? {
            name: "Maria Souza",
            document: REGISTERED_CPF,
            birthDate: "1990-05-20",
            email: "maria@email.com",
            telephone: "11987654321",
            address: {
              zipCode: "45204303",
              streetName: "Rua Pau d'Arco",
              streetNumber: "28",
              streetComplement: "",
              streetDistrict: "São Judas Tadeu",
              city: "Jequié",
              state: "BA",
            },
          }
        : null,
    );
  });

  it("clears contact and address from the previous record when the CPF changes", async () => {
    const { hook, guarantor } = renderGuarantorAutoFill();

    act(() => hook.result.current.onCpfChange(REGISTERED_CPF));
    await waitFor(() => expect(hook.result.current.status).toBe("found"));
    expect(guarantor()).toMatchObject({
      name: "Maria Souza",
      email: "maria@email.com",
      zipCode: "45204-303",
      city: "Jequié",
    });

    act(() => hook.result.current.onCpfChange(NEW_CPF));
    await waitFor(() =>
      expect(findFormDataByCpf).toHaveBeenCalledWith(
        NEW_CPF,
        expect.anything(),
      ),
    );
    await waitFor(() => expect(guarantor().name).toBe(""));
    expect(guarantor()).toMatchObject({
      email: "",
      phone: "",
      zipCode: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    });
    expect(hook.result.current.status).toBe("idle");
  });

  it("keeps what the user typed over the previous record", async () => {
    const { hook, guarantor, form } = renderGuarantorAutoFill();

    act(() => hook.result.current.onCpfChange(REGISTERED_CPF));
    await waitFor(() => expect(hook.result.current.status).toBe("found"));
    act(() => form().setValue("guarantor.number", "100"));

    act(() => hook.result.current.onCpfChange("333"));
    await waitFor(() => expect(guarantor().name).toBe(""));
    expect(guarantor().number).toBe("100");
    expect(findFormDataByCpf).toHaveBeenCalledTimes(1);
  });
});
