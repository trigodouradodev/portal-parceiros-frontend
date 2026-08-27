import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("usa o token de skeleton, não o muted do fundo da página", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).toContain("bg-skeleton");
    expect(el.className).toContain("animate-pulse");
    expect(el.className).not.toContain("bg-muted");
  });

  it("permite sobrescrever o fundo (ex.: header navy)", () => {
    const { container } = render(<Skeleton className="bg-brand-navy/15" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).toContain("bg-brand-navy/15");
    expect(el.className).not.toContain("bg-skeleton");
  });
});
