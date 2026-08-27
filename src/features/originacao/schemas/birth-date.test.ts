import { describe, expect, it } from "vitest";
import {
  CLIENT_BIRTH_DATE_MESSAGE,
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
});
