/**
 * ============================================
 * KRIOU DOCS - useConfirm Hook
 * ============================================
 * Provê um fluxo de confirmação sem bloquear
 * a thread. Usa estado React em vez de
 * window.confirm() que bloqueia a UI.
 *
 * Uso:
 *   const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
 *
 *   // Dispara o diálogo
 *   const confirmed = await requestConfirm({ title: "Excluir?", message: "..." });
 *   if (confirmed) deleteSomething();
 *
 *   // Renderiza o diálogo no JSX
 *   <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
 *
 * @module hooks/useConfirm
 */

import { useState, useCallback, useRef } from "react";

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
    danger: false,
  });
  const resolverRef = useRef(null);

  /**
   * Exibe o diálogo e retorna uma Promise que resolve com true/false.
   * @param {Partial<typeof confirmState>} options
   * @returns {Promise<boolean>}
   */
  const requestConfirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({ open: true, confirmLabel: "Confirmar", cancelLabel: "Cancelar", danger: false, ...options });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    resolverRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    resolverRef.current?.(false);
  }, []);

  return { confirmState, requestConfirm, handleConfirm, handleCancel };
}

export default useConfirm;
