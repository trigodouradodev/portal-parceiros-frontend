import { renderHook, waitFor } from "@testing-library/react";
import {
  EmailDeliverabilityStatus,
  useEmailDeliverability,
} from "@/features/originacao/hooks/useEmailDeliverability";
import { emailValidationService } from "@/services/email-validation/email-validation.service";

vi.mock("@/services/email-validation/email-validation.service", () => ({
  emailValidationService: { validate: vi.fn() },
}));

const validate = vi.mocked(emailValidationService.validate);

describe("useEmailDeliverability", () => {
  beforeEach(() => {
    validate.mockReset();
  });

  it("stays unchecked for an empty or malformed e-mail, without calling the API", async () => {
    const { result, rerender } = renderHook(
      ({ email }: { email: string }) => useEmailDeliverability(email),
      { initialProps: { email: "" } },
    );
    expect(result.current.status).toBe(EmailDeliverabilityStatus.UNCHECKED);

    rerender({ email: "maria@" });
    expect(result.current.status).toBe(EmailDeliverabilityStatus.UNCHECKED);
    expect(validate).not.toHaveBeenCalled();
  });

  it("checks a well-formed e-mail after the debounce and reports ok when acceptable", async () => {
    validate.mockResolvedValue({
      email: "maria@email.com",
      status: "valid",
      subStatus: "",
      isAcceptable: true,
      checked: true,
      didYouMean: null,
    });

    const { result } = renderHook(() =>
      useEmailDeliverability("maria@email.com"),
    );

    expect(result.current.status).toBe(EmailDeliverabilityStatus.CHECKING);

    await waitFor(() => {
      expect(result.current.status).toBe(EmailDeliverabilityStatus.OK);
    });
    expect(validate).toHaveBeenCalledWith("maria@email.com");
  });

  it("reports blocked when the ZeroBounce reproves the e-mail", async () => {
    validate.mockResolvedValue({
      email: "maria@email.com",
      status: "invalid",
      subStatus: "mailbox_not_found",
      isAcceptable: false,
      checked: true,
      didYouMean: null,
    });

    const { result } = renderHook(() =>
      useEmailDeliverability("maria@email.com"),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(EmailDeliverabilityStatus.BLOCKED);
    });
  });

  it("fails open as unavailable when checked=false, never as blocked", async () => {
    validate.mockResolvedValue({
      email: "maria@email.com",
      status: "unknown",
      subStatus: "",
      isAcceptable: true,
      checked: false,
      didYouMean: null,
    });

    const { result } = renderHook(() =>
      useEmailDeliverability("maria@email.com"),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(EmailDeliverabilityStatus.UNAVAILABLE);
    });
  });

  it("fails open as unavailable when the API call rejects", async () => {
    validate.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() =>
      useEmailDeliverability("maria@email.com"),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(EmailDeliverabilityStatus.UNAVAILABLE);
    });
  });

  it("ignores a stale response when the e-mail changes before it resolves", async () => {
    let resolveFirst!: (value: Awaited<ReturnType<typeof validate>>) => void;
    validate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );
    validate.mockResolvedValueOnce({
      email: "second@email.com",
      status: "valid",
      subStatus: "",
      isAcceptable: true,
      checked: true,
      didYouMean: null,
    });

    const { result, rerender } = renderHook(
      ({ email }: { email: string }) => useEmailDeliverability(email),
      { initialProps: { email: "first@email.com" } },
    );

    await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
    rerender({ email: "second@email.com" });
    await waitFor(() => expect(validate).toHaveBeenCalledTimes(2));

    await waitFor(() => {
      expect(result.current.status).toBe(EmailDeliverabilityStatus.OK);
    });

    // Resposta atrasada do primeiro e-mail não deve sobrescrever o estado
    // já resolvido para o segundo e-mail.
    resolveFirst({
      email: "first@email.com",
      status: "invalid",
      subStatus: "",
      isAcceptable: false,
      checked: true,
      didYouMean: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.status).toBe(EmailDeliverabilityStatus.OK);
  });
});
