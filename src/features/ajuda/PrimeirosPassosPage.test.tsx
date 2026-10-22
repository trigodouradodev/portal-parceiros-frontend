import { render, screen } from "@testing-library/react";
import { PrimeirosPassosPage } from "@/features/ajuda/PrimeirosPassosPage";

describe("PrimeirosPassosPage", () => {
  it("mostra o manual Primeiros Passos num iframe isolado", () => {
    render(<PrimeirosPassosPage />);

    const frame = screen.getByTitle("Primeiros Passos no Portal");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame.getAttribute("srcdoc")).toContain(
      "<title>Primeiros Passos no Portal</title>",
    );
  });
});
