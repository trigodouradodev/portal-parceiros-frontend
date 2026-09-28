import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      screen.queryByText(/localizado só de forma aproximada/i),
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
      screen.getByText(/localizado só de forma aproximada/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/visitando você/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar presença/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ir até o endereço/i }),
    ).toBeInTheDocument();
  });

  it("mostra o endereço geocodificado quando o pin não é confiável", () => {
    render(
      <NotFoundStatus
        distanceMeters={405168}
        addressLikelyWrong
        matchedAddress="R. Extensão Nova - Remanso, BA, 47200-000, Brazil"
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/R\. Extensão Nova - Remanso, BA/i),
    ).toBeInTheDocument();
  });

  it("não mostra o alerta quando não há distância — sem geocoding pra comparar", () => {
    render(<NotFoundStatus addressLikelyWrong onConfirmManual={vi.fn()} />);

    expect(
      screen.queryByText(/localizado só de forma aproximada/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível obter sua localização"),
    ).toBeInTheDocument();
  });

  it("diferencia permissão negada de GPS indisponível", () => {
    const { rerender } = render(
      <NotFoundStatus
        geoFailureReason="permission_denied"
        geoPermissionState="denied"
        onConfirmManual={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Libere a localização")).toBeInTheDocument();
    expect(
      screen.getByText(/não vai mais perguntar onde você está/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/escolha Permitir/i)).toBeInTheDocument();
    expect(screen.queryByText(/visitando você/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar presença/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tentar novamente/i }),
    ).toBeInTheDocument();

    rerender(
      <NotFoundStatus
        geoFailureReason="position_unavailable"
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Não foi possível obter sua localização"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ative o GPS do celular/i)).toBeInTheDocument();
  });

  it("mantém tentar novamente em destaque quando o navegador ainda pode pedir permissão", () => {
    render(
      <NotFoundStatus
        geoFailureReason="permission_denied"
        geoPermissionState="prompt"
        onConfirmManual={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/ainda pode pedir a localização/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/visitando você/i)).toBeInTheDocument();
  });

  it("exige motivo antes de confirmar manualmente", async () => {
    const user = userEvent.setup();
    const onConfirmManual = vi.fn();
    render(<NotFoundStatus onConfirmManual={onConfirmManual} />);

    const confirm = screen.getByRole("button", {
      name: /Confirmar presença/i,
    });
    expect(confirm).toBeDisabled();

    await user.click(
      screen.getByLabelText(/celular não conseguiu me localizar/i),
    );
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirmManual).toHaveBeenCalledWith(
      "device_unavailable",
      undefined,
    );
  });

  it("oferece o motivo do pin aproximado em vez de culpar o aparelho", () => {
    render(
      <NotFoundStatus
        distanceMeters={34996.7}
        addressLikelyWrong
        onConfirmManual={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(/Estou no endereço do cliente/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/celular não conseguiu me localizar/i),
    ).not.toBeInTheDocument();
  });

  it("troca os motivos do aparelho por permissão quando o site está bloqueado", () => {
    render(
      <NotFoundStatus
        geoFailureReason="permission_denied"
        geoPermissionState="denied"
        onConfirmManual={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(/Não consigo liberar a localização/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/celular não conseguiu me localizar/i),
    ).not.toBeInTheDocument();
  });

  it("exige descrição quando o motivo é outro", async () => {
    const user = userEvent.setup();
    const onConfirmManual = vi.fn();
    render(<NotFoundStatus onConfirmManual={onConfirmManual} />);

    const confirm = screen.getByRole("button", {
      name: /Confirmar presença/i,
    });

    await user.click(screen.getByLabelText(/Outro motivo/i));
    expect(confirm).toBeDisabled();

    await user.type(
      screen.getByLabelText(/Descreva o motivo/i),
      "encontrei na praça",
    );
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirmManual).toHaveBeenCalledWith("other", "encontrei na praça");
  });
});
