/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("publica o novo valor somente após o atraso configurado", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: "inicial" } }
    );

    rerender({ value: "final" });
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe("inicial");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("final");
  });

  it("cancela o timer anterior quando o valor muda durante o atraso", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: "inicial" } }
    );

    rerender({ value: "intermediário" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "final" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("inicial");

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("final");
  });

  it("limpa o timer pendente ao desmontar", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("valor"));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });
});
