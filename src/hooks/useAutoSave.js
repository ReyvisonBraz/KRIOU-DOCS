/**
 * ============================================
 * KRIOU DOCS - useAutoSave Hook
 * ============================================
 * Auto-save com debounce e feedback visual.
 *
 * FLUXO:
 *   1. Observa `data` — qualquer alteracao inicia o debounce
 *   2. Apos `delayMs` sem novas alteracoes, chama `saveFn(data)`
 *   3. Atualiza saveStatus: "idle" → "saving" → "saved" | "error"
 *   4. triggerSave() pode ser chamado manualmente para salvar imediatamente
 *
 * USO:
 *   const { saveStatus, lastSaved, triggerSave } = useAutoSave(formData, saveFn, 1500);
 *
 * BUG CONHECIDO (CORRIGIDO):
 *   triggerSave() usava `data` do closure, que ficava stale.
 *   Agora usa useRef(dataRef) para sempre acessar o valor mais recente.
 *
 * LOGS: Prefixo [useAutoSave] para facilitar filtragem.
 *
 * @param {any}      data    - Dados a observar
 * @param {Function} saveFn  - Funcao que persiste os dados (pode ser async)
 * @param {number}   delayMs - Debounce em ms (default 1500)
 * @returns {{ saveStatus, lastSaved, triggerSave }}
 * ============================================
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { logger } from "../utils/logger";

export function useAutoSave(data, saveFn, delayMs = 1500) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);
  const saveFnRef = useRef(saveFn);
  const dataRef = useRef(data);
  const skipNextChangeRef = useRef(false);
  const failedSaveRef = useRef(false);

  // Manter referencias sempre atualizadas
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ─── triggerSave — salva imediatamente com dados mais recentes ───────────
  const triggerSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await saveFnRef.current(dataRef.current);
      failedSaveRef.current = false;
      setSaveStatus("saved");
      setLastSaved(new Date());
      return true;
    } catch (err) {
      failedSaveRef.current = true;
      logger.error("useAutoSave", "Sincronização manual falhou", err);
      setSaveStatus("error");
      return false;
    }
  }, []);

  useEffect(() => {
    const retryWhenOnline = () => {
      if (failedSaveRef.current) void triggerSave();
    };
    window.addEventListener("online", retryWhenOnline);
    return () => window.removeEventListener("online", retryWhenOnline);
  }, [triggerSave]);

  // Usado ao descartar um rascunho: cancela a gravacao agendada e impede que
  // o reset do formulario recrie o rascunho logo depois da exclusao.
  const discardPendingSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    skipNextChangeRef.current = true;
    failedSaveRef.current = false;
    setSaveStatus("idle");
  }, []);

  // ─── Auto-save com debounce ──────────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (skipNextChangeRef.current) {
      skipNextChangeRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    // O feedback "saving" precisa aparecer imediatamente após a alteração,
    // antes do debounce concluir. Esta atualização é intencional neste hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await saveFnRef.current(dataRef.current);
        failedSaveRef.current = false;
        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch (err) {
        failedSaveRef.current = true;
        logger.error("useAutoSave", "Sincronização automática falhou", err);
        setSaveStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delayMs]);

  return { saveStatus, lastSaved, triggerSave, discardPendingSave };
}

export default useAutoSave;
