import { cn, fmtBRL } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});

describe("fmtBRL", () => {
  it("formats currency in pt-BR", () => {
    expect(fmtBRL(1500)).toMatch(/R\$\s*1\.500,00/);
    expect(fmtBRL(0)).toMatch(/R\$\s*0,00/);
  });
});
