import { describe, expect, it } from "vitest";
import { buildCtaLabel } from "./timeline-styles";

describe("buildCtaLabel", () => {
  it("prefixa 'Registrar' num label de ação real", () => {
    expect(buildCtaLabel("Contato")).toBe("Registrar Contato");
    expect(buildCtaLabel("Visita")).toBe("Registrar Visita");
  });

  it("não duplica 'Registrar' quando o label já começa com ele", () => {
    // Bug real (visto em produção): o passo de fallback sem tarefa/follow-up
    // natural em andamento já usa "Registrar próxima ação" como label —
    // sem essa checagem, o botão mostrava "Registrar Registrar próxima ação".
    expect(buildCtaLabel("Registrar próxima ação")).toBe(
      "Registrar próxima ação",
    );
  });

  it("a checagem de prefixo ignora maiúsculas/minúsculas", () => {
    expect(buildCtaLabel("registrar visita")).toBe("registrar visita");
  });
});
