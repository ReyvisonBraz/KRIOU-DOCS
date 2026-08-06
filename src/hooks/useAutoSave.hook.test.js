/**
 * ============================================
 * KRIOU DOCS - Testes: useAutoSave hook
 * ============================================
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa com status 'idle'", () => {
    const saveFn = vi.fn();
    const { result } = renderHook(() => useAutoSave("dado inicial", saveFn, 1500));
    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.lastSaved).toBeNull();
  });

  it("não chama saveFn na montagem inicial", () => {
    const saveFn = vi.fn();
    renderHook(() => useAutoSave("dado", saveFn, 1500));
    act(() => { vi.runAllTimers(); });
    expect(saveFn).not.toHaveBeenCalled();
  });

  it("muda para 'saving' imediatamente ao alterar dados", () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    let data = "v1";
    const { result, rerender } = renderHook(() => useAutoSave(data, saveFn, 1500));

    act(() => { data = "v2"; rerender(); });

    expect(result.current.saveStatus).toBe("saving");
  });

  it("chama saveFn após o delay e muda para 'saved'", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    let data = "v1";
    const { result, rerender } = renderHook(() => useAutoSave(data, saveFn, 1500));

    act(() => { data = "v2"; rerender(); });
    await act(async () => { vi.advanceTimersByTime(1500); });

    expect(saveFn).toHaveBeenCalledOnce();
    expect(saveFn).toHaveBeenCalledWith("v2");
    expect(result.current.saveStatus).toBe("saved");
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it("reseta o debounce em alterações rápidas (digitar)", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    let data = "v1";
    const { rerender } = renderHook(() => useAutoSave(data, saveFn, 1500));

    // Três alterações em 300ms cada
    act(() => { data = "v2"; rerender(); });
    act(() => { vi.advanceTimersByTime(300); data = "v3"; rerender(); });
    act(() => { vi.advanceTimersByTime(300); data = "v4"; rerender(); });

    // Ainda não deve ter salvo
    expect(saveFn).not.toHaveBeenCalled();

    // Agora passa o delay completo
    await act(async () => { vi.advanceTimersByTime(1500); });

    // Salva apenas uma vez com o valor final
    expect(saveFn).toHaveBeenCalledOnce();
    expect(saveFn).toHaveBeenCalledWith("v4");
  });

  it("muda para 'error' quando saveFn lança exceção", async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error("falha de rede"));
    let data = "v1";
    const { result, rerender } = renderHook(() => useAutoSave(data, saveFn, 500));

    act(() => { data = "v2"; rerender(); });
    await act(async () => { vi.advanceTimersByTime(500); });

    expect(result.current.saveStatus).toBe("error");
  });

  it("triggerSave salva imediatamente e muda para 'saved'", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave("dado", saveFn, 1500));

    await act(async () => { await result.current.triggerSave(); });

    expect(saveFn).toHaveBeenCalledOnce();
    expect(result.current.saveStatus).toBe("saved");
  });

  it("tenta sincronizar novamente quando a conexão volta", async () => {
    const saveFn = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    let data = "v1";
    const { result, rerender } = renderHook(() => useAutoSave(data, saveFn, 500));

    act(() => { data = "v2"; rerender(); });
    await act(async () => { vi.advanceTimersByTime(500); });
    expect(result.current.saveStatus).toBe("error");

    await act(async () => { window.dispatchEvent(new Event("online")); });

    expect(saveFn).toHaveBeenCalledTimes(2);
    expect(saveFn).toHaveBeenLastCalledWith("v2");
    expect(result.current.saveStatus).toBe("saved");
  });

  it("respeita delayMs customizado", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    let data = "v1";
    const { rerender } = renderHook(() => useAutoSave(data, saveFn, 3000));

    act(() => { data = "v2"; rerender(); });

    // Antes do delay não deve ter salvo
    act(() => { vi.advanceTimersByTime(2999); });
    expect(saveFn).not.toHaveBeenCalled();

    // Após o delay deve salvar
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(saveFn).toHaveBeenCalledOnce();
  });

  it("descarta o timer pendente e nao recria o rascunho durante o reset", () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    let data = "preenchido";
    const { result, rerender } = renderHook(() => useAutoSave(data, saveFn, 1500));

    act(() => { data = "alterado"; rerender(); });
    act(() => {
      result.current.discardPendingSave();
      data = "estado inicial";
      rerender();
      vi.runAllTimers();
    });

    expect(saveFn).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toBe("idle");
  });
});
