/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useConfirm } from "./useConfirm";

describe("useConfirm", () => {
  it("abre com defaults e resolve true ao confirmar", async () => {
    const { result } = renderHook(() => useConfirm());
    let decision;

    act(() => {
      decision = result.current.requestConfirm({ title: "Excluir?", message: "Não pode ser desfeito", danger: true });
    });

    expect(result.current.confirmState).toEqual({
      open: true,
      title: "Excluir?",
      message: "Não pode ser desfeito",
      confirmLabel: "Confirmar",
      cancelLabel: "Cancelar",
      danger: true,
    });

    act(() => result.current.handleConfirm());
    await expect(decision).resolves.toBe(true);
    expect(result.current.confirmState.open).toBe(false);
  });

  it("preserva rótulos customizados e resolve false ao cancelar", async () => {
    const { result } = renderHook(() => useConfirm());
    let decision;

    act(() => {
      decision = result.current.requestConfirm({
        title: "Sair?",
        confirmLabel: "Sim, sair",
        cancelLabel: "Continuar",
      });
    });

    expect(result.current.confirmState).toEqual(expect.objectContaining({
      open: true,
      confirmLabel: "Sim, sair",
      cancelLabel: "Continuar",
      danger: false,
    }));

    act(() => result.current.handleCancel());
    await expect(decision).resolves.toBe(false);
    expect(result.current.confirmState.open).toBe(false);
  });
});
