import { render, screen } from "@testing-library/react";
import { NotFoundStatus } from "./NotFoundStatus";

describe("NotFoundStatus", () => {
  it("não mostra o alerta de endereço incorreto por padrão", () => {
    render(
      <NotFoundStatus
        distanceMeters={250}
        radiusMeters={100}
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(/endereço cadastrado pode estar incorreto/i),
    ).not.toBeInTheDocument();
  });

  it("mostra o alerta de endereço incorreto quando addressLikelyWrong é true (AUREA-352)", () => {
    render(
      <NotFoundStatus
        distanceMeters={34996.7}
        radiusMeters={100}
        addressLikelyWrong
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/endereço cadastrado pode estar incorreto/i),
    ).toBeInTheDocument();
  });

  it("não mostra o alerta quando não há distância — sem geocoding pra comparar", () => {
    render(<NotFoundStatus addressLikelyWrong onConfirmManual={vi.fn()} />);

    expect(
      screen.queryByText(/endereço cadastrado pode estar incorreto/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível obter sua localização"),
    ).toBeInTheDocument();
  });
});
