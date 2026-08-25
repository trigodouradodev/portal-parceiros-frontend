import { render, screen } from "@testing-library/react";
import { NotFoundStatus } from "./NotFoundStatus";

describe("NotFoundStatus", () => {
  it("mostra a distância calculada e o título assertivo por padrão", () => {
    render(
      <NotFoundStatus
        distanceMeters={250}
        radiusMeters={100}
        onConfirmManual={vi.fn()}
      />,
    );

    expect(screen.getByText("Você não está no endereço")).toBeInTheDocument();
    expect(screen.getByText(/Distância: 250m/)).toBeInTheDocument();
    expect(
      screen.queryByText(/não conseguimos confirmar com precisão/i),
    ).not.toBeInTheDocument();
  });

  it("esconde a distância e troca o título quando addressLikelyWrong é true (AUREA-352)", () => {
    // A distância calculada pode estar errada por vários km quando o
    // geocoding não é confiável — mostrar o número, mesmo com um aviso ao
    // lado, ainda passaria a mensagem falsa de "você está longe".
    render(
      <NotFoundStatus
        distanceMeters={34996.7}
        radiusMeters={100}
        addressLikelyWrong
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Não foi possível confirmar sua localização"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/34.996|34996/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/não conseguimos confirmar com precisão/i),
    ).toBeInTheDocument();
  });

  it("não mostra o alerta quando não há distância — sem geocoding pra comparar", () => {
    render(<NotFoundStatus addressLikelyWrong onConfirmManual={vi.fn()} />);

    expect(
      screen.queryByText(/não conseguimos confirmar com precisão/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível obter sua localização"),
    ).toBeInTheDocument();
  });
});
