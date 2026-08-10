/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUnsavedChanges } from "./useUnsavedChanges";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useUnsavedChanges", () => {
  it("não registra bloqueio quando não há alteração pendente", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useUnsavedChanges(false));

    expect(addSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("bloqueia beforeunload com a mensagem configurada", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const message = "Existem alterações pendentes";
    const { unmount } = renderHook(() => useUnsavedChanges(true, message));
    const handler = addSpy.mock.calls.find(([event]) => event === "beforeunload")[1];
    const event = { preventDefault: vi.fn(), returnValue: undefined };

    expect(handler(event)).toBe(message);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.returnValue).toBe(message);

    const removeSpy = vi.spyOn(window, "removeEventListener");
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", handler);
  });

  it("remove o listener quando o formulário deixa de estar sujo", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { rerender } = renderHook(({ dirty }) => useUnsavedChanges(dirty), {
      initialProps: { dirty: true },
    });
    const handler = addSpy.mock.calls.find(([event]) => event === "beforeunload")[1];

    rerender({ dirty: false });

    expect(removeSpy).toHaveBeenCalledWith("beforeunload", handler);
  });
});
