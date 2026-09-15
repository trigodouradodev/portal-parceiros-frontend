import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
  it("executa o cancelamento sem confirmar a ação", () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Continuar?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("fecha após confirmar sem executar o cancelamento", async () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Continuar?"
        confirmLabel="Continuar"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
