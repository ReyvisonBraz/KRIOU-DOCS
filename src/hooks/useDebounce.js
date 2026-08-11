/**
 * ============================================
 * KRIOU DOCS - useDebounce Hook
 * ============================================
 * Atrasa a publicação de um valor até que ele
 * permaneça estável pelo período configurado.
 *
 * @module hooks/useDebounce
 */

import { useEffect, useState } from "react";

/**
 * @param {any} value - Valor a publicar após o atraso
 * @param {number} delay - Atraso em milissegundos
 * @returns {any} Valor estabilizado
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
