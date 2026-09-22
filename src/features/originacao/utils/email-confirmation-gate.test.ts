import { describe, expect, it } from "vitest";
import { EmailDeliverabilityStatus } from "@/features/originacao/hooks/useEmailDeliverability";
import { getBlockedEmailField } from "@/features/originacao/utils/email-confirmation-gate";

const { UNCHECKED, CHECKING, OK, BLOCKED, UNAVAILABLE } =
  EmailDeliverabilityStatus;

describe("getBlockedEmailField", () => {
  it("blocks on step 0 (Cadastro) when the registration e-mail is blocked", () => {
    expect(getBlockedEmailField(0, BLOCKED, UNCHECKED)).toBe(
      "registration.email",
    );
  });

  it("blocks on step 4 (Avalista) when the guarantor e-mail is blocked", () => {
    expect(getBlockedEmailField(4, UNCHECKED, BLOCKED)).toBe("guarantor.email");
  });

  it.each([UNCHECKED, CHECKING, OK, UNAVAILABLE])(
    "never blocks step 0 for status %s — only blocked does",
    (status) => {
      expect(getBlockedEmailField(0, status, UNCHECKED)).toBeNull();
    },
  );

  it.each([UNCHECKED, CHECKING, OK, UNAVAILABLE])(
    "never blocks step 4 for status %s — only blocked does",
    (status) => {
      expect(getBlockedEmailField(4, UNCHECKED, status)).toBeNull();
    },
  );

  it("never blocks a step other than 0 or 4, even if a status is blocked", () => {
    for (let step = 1; step <= 6; step++) {
      if (step === 4) continue;
      expect(getBlockedEmailField(step, BLOCKED, BLOCKED)).toBeNull();
    }
  });

  it("does not confuse the registration e-mail status with the guarantor's", () => {
    // Cadastro bloqueado, mas o step atual é o do avalista — não bloqueia.
    expect(getBlockedEmailField(4, BLOCKED, OK)).toBeNull();
    // Avalista bloqueado, mas o step atual é o do cadastro — não bloqueia.
    expect(getBlockedEmailField(0, OK, BLOCKED)).toBeNull();
  });
});
