/**
 * ============================================
 * KRIOU DOCS - useUnsavedChanges Hook
 * ============================================
 * Avisa o usuário ao tentar fechar/recarregar
 * a aba com alterações não salvas.
 *
 * Uso:
 *   useUnsavedChanges(isDirty);
 *   // isDirty = true quando há dados não salvos
 *
 * @module hooks/useUnsavedChanges
 */

import { useEffect } from "react";

/**
 * @param {boolean} isDirty - True enquanto há alterações pendentes
 * @param {string}  message - Mensagem personalizada (suporte limitado nos browsers)
 */
export function useUnsavedChanges(
  isDirty,
  message = "Você tem alterações não salvas. Deseja sair mesmo assim?"
) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      // Chrome exige o returnValue para mostrar o diálogo nativo
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, message]);
}

export default useUnsavedChanges;
