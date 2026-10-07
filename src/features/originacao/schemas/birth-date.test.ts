import { describe, expect, it } from "vitest";
import {
  CLIENT_BIRTH_DATE_MESSAGE,
  GUARANTOR_BIRTH_DATE_MESSAGE,
  INVALID_BIRTH_DATE_MESSAGE,
  birthDateSchema,
} from "@/features/originacao/schemas/birth-date";
import { todayIsoLocal } from "@/features/originacao/utils/calc-age";

const schema = birthDateSchema(CLIENT_BIRTH_DATE_MESSAGE);

describe("birthDateSchema", () => {
  it("rejects an empty date", () => {
    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("").error?.issues[0]?.message).toBe(
      "Informe a data de nascimento",
    );
  });

  it("rejects today and other underage dates", () => {
    expect(schema.safeParse(todayIsoLocal()).success).toBe(false);
    const underage = schema.safeParse("2015-01-01");
    expect(underage.success).toBe(false);
    if (!underage.success) {
      expect(underage.error.issues[0]?.message).toBe(CLIENT_BIRTH_DATE_MESSAGE);
    }
  });

  it("accepts an adult birth date", () => {
    expect(schema.safeParse("1990-01-01").success).toBe(true);
  });

  it.each([
    "1990-02-31",
    "1990-04-31",
    "1990-13-01",
    "1990-01-00",
    "1900-02-29",
    "20/05/199",
    "20/05/1990",
  ])(
    "rejects invalid or incomplete date %s with the format message",
    (value) => {
      const result = schema.safeParse(value);
      expect(result.error?.issues[0]?.message).toBe(INVALID_BIRTH_DATE_MESSAGE);
    },
  );

  it("accepts a real leap day", () => {
    expect(schema.safeParse("2000-02-29").success).toBe(true);
  });

  it("keeps the age limits and the guarantor message", () => {
    expect(schema.safeParse("1800-01-01").error?.issues[0]?.message).toBe(
      CLIENT_BIRTH_DATE_MESSAGE,
    );
    const guarantor = birthDateSchema(GUARANTOR_BIRTH_DATE_MESSAGE);
    expect(guarantor.safeParse(todayIsoLocal()).error?.issues[0]?.message).toBe(
      GUARANTOR_BIRTH_DATE_MESSAGE,
    );
    expect(guarantor.safeParse("1990-02-31").error?.issues[0]?.message).toBe(
      INVALID_BIRTH_DATE_MESSAGE,
    );
  });
});
