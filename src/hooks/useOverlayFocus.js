import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

let bodyLockCount = 0;
let previousBodyOverflow = "";
let inertRootCount = 0;
let rootWasInert = false;

const lockBodyScroll = () => {
  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  bodyLockCount += 1;
};

const unlockBodyScroll = () => {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) document.body.style.overflow = previousBodyOverflow;
};

const makeAppRootInert = () => {
  const root = document.getElementById("root");
  if (!root) return;
  if (inertRootCount === 0) rootWasInert = root.hasAttribute("inert");
  inertRootCount += 1;
  root.setAttribute("inert", "");
};

const restoreAppRoot = () => {
  const root = document.getElementById("root");
  inertRootCount = Math.max(0, inertRootCount - 1);
  if (root && inertRootCount === 0 && !rootWasInert) root.removeAttribute("inert");
};

/**
 * Centraliza o comportamento acessível dos overlays da aplicação:
 * foco inicial, contenção do Tab, fechamento por Escape, restauração do foco
 * e bloqueio de rolagem da página.
 */
export const useOverlayFocus = ({ open, containerRef, initialFocusRef, onClose, closeDisabled = false, inertRoot = false }) => {
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeDisabledRef.current = closeDisabled;
  }, [closeDisabled, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    lockBodyScroll();
    if (inertRoot) makeAppRootInert();

    const focusFrame = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      const preferredTarget = initialFocusRef?.current;
      const firstTarget = container?.querySelector(FOCUSABLE_SELECTOR);
      (preferredTarget || firstTarget || container)?.focus?.();
    });

    const handleKeyDown = (event) => {
      const container = containerRef.current;
      if (event.key === "Escape" && !closeDisabledRef.current) {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      unlockBodyScroll();
      if (inertRoot) restoreAppRoot();
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [containerRef, inertRoot, initialFocusRef, open]);
};

export default useOverlayFocus;
