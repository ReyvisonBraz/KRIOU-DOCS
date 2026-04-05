/**
 * ============================================
 * KRIOU DOCS - useAutoSave Hook
 * ============================================
 * Debounce + save com feedback visual.
 * Substitui a lógica duplicada de auto-save
 * que existia diretamente no AppContext.
 *
 * Uso:
 *   const { saveStatus, lastSaved, triggerSave } = useAutoSave(data, saveFn, 1500);
 *
 * @module hooks/useAutoSave
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * @param {any}      data      - Dados a observar (qualquer valor serializável)
 * @param {Function} saveFn    - Função que persiste os dados; pode ser async
 * @param {number}   delayMs   - Debounce em ms (default 1500)
 * @returns {{ saveStatus: "idle"|"saving"|"saved"|"error", lastSaved: Date|null, triggerSave: Function }}
 */
export function useAutoSave(data, saveFn, delayMs = 1500) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);
  const saveFnRef = useRef(saveFn);

  // Manter referência estável da função de save
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  const triggerSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await saveFnRef.current(data);
      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (err) {
      console.error("[useAutoSave] Save failed:", err);
      setSaveStatus("error");
    }
  }, [data]);

  useEffect(() => {
    // Não salvar na montagem inicial
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setSaveStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await saveFnRef.current(data);
        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch (err) {
        console.error("[useAutoSave] Auto-save failed:", err);
        setSaveStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, delayMs]);

  return { saveStatus, lastSaved, triggerSave };
}

export default useAutoSave;
