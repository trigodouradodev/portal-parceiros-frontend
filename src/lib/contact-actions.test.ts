import {
  formatClientAddress,
  hasCallablePhone,
  hasValidAddress,
  normalizePhoneDigits,
  toMapsNavigationUrl,
  toTelUrl,
  toWhatsAppUrl,
} from "@/lib/contact-actions";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";

const validAddress: ClientAddress = {
  street: "Rua das Flores",
  number: "100",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310100",
  complement: "Sala 2",
};

describe("normalizePhoneDigits", () => {
  it("adds Brazil country code to local numbers", () => {
    expect(normalizePhoneDigits("(11) 98765-4321")).toBe("5511987654321");
    expect(normalizePhoneDigits("11987654321")).toBe("5511987654321");
  });

  it("keeps numbers that already include country code", () => {
    expect(normalizePhoneDigits("5511987654321")).toBe("5511987654321");
  });

  it("treats area code 55 as a local number, not as the country code", () => {
    expect(normalizePhoneDigits("(55) 99302-5095")).toBe("5555993025095");
    expect(normalizePhoneDigits("55993025095")).toBe("5555993025095");
    expect(normalizePhoneDigits("(55) 3222-1234")).toBe("555532221234");
  });

  it("keeps area code 55 numbers that already include country code", () => {
    expect(normalizePhoneDigits("+55 (55) 99302-5095")).toBe("5555993025095");
    expect(normalizePhoneDigits("+55 (55) 3222-1234")).toBe("555532221234");
    expect(normalizePhoneDigits("+55 11 98765-4321")).toBe("5511987654321");
  });

  it("returns null for invalid lengths", () => {
    expect(normalizePhoneDigits("123")).toBeNull();
    expect(normalizePhoneDigits("")).toBeNull();
    expect(normalizePhoneDigits("55123")).toBeNull();
    expect(normalizePhoneDigits("993025095")).toBeNull();
    expect(normalizePhoneDigits("55993025095123")).toBeNull();
    expect(normalizePhoneDigits("44987654321123")).toBeNull();
  });
});

describe("hasCallablePhone", () => {
  it("returns false for empty values", () => {
    expect(hasCallablePhone()).toBe(false);
    expect(hasCallablePhone(null)).toBe(false);
    expect(hasCallablePhone("")).toBe(false);
  });

  it("returns true for valid phones", () => {
    expect(hasCallablePhone("11987654321")).toBe(true);
  });
});

describe("toTelUrl / toWhatsAppUrl", () => {
  it("builds tel and WhatsApp URLs for area code 55 without country code", () => {
    expect(toTelUrl("(55) 99302-5095")).toBe("tel:+5555993025095");
    expect(toWhatsAppUrl("(55) 99302-5095")).toBe(
      "https://wa.me/5555993025095",
    );
    expect(hasCallablePhone("(55) 99302-5095")).toBe(true);
  });

  it("builds tel and WhatsApp URLs", () => {
    expect(toTelUrl("11987654321")).toBe("tel:+5511987654321");
    expect(toWhatsAppUrl("11987654321")).toBe("https://wa.me/5511987654321");
    expect(toWhatsAppUrl("11987654321", "Olá")).toBe(
      "https://wa.me/5511987654321?text=Ol%C3%A1",
    );
  });

  it("throws on invalid phone", () => {
    expect(() => toTelUrl("abc")).toThrow("Invalid phone number");
    expect(() => toWhatsAppUrl("abc")).toThrow("Invalid phone number");
  });
});

describe("formatClientAddress", () => {
  it("formats a full address with CEP mask", () => {
    expect(formatClientAddress(validAddress)).toBe(
      "Rua das Flores, 100 – Sala 2 – Centro – São Paulo – SP – CEP 01310-100",
    );
  });
});

describe("hasValidAddress", () => {
  it("requires street, number, neighborhood and city", () => {
    expect(hasValidAddress(validAddress)).toBe(true);
    expect(hasValidAddress(null)).toBe(false);
    expect(
      hasValidAddress({ ...validAddress, street: "  ", number: "100" }),
    ).toBe(false);
  });
});

describe("toMapsNavigationUrl", () => {
  it("prefers coordinates when provided", () => {
    expect(
      toMapsNavigationUrl(validAddress, {
        latitude: -23.5,
        longitude: -46.6,
      }),
    ).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-23.5,-46.6&travelmode=driving",
    );
  });

  it("encodes address when there are no coordinates", () => {
    const url = toMapsNavigationUrl(validAddress);
    expect(url).toContain("destination=");
    expect(url).toContain("travelmode=driving");
  });

  it("throws when address is invalid and no coordinates", () => {
    expect(() => toMapsNavigationUrl()).toThrow("Invalid address");
  });
});
