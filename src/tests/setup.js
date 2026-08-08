// Setup file carregado apenas nos testes que rodam em jsdom.
// Os testes de utils (node env) não usam este arquivo.
import "@testing-library/jest-dom";

// O jsdom desta versão não expõe localStorage/sessionStorage, mas boa parte
// do app depende deles (preferência de tema, rascunhos, sessão). Fornecemos
// uma implementação em memória para que os testes possam verificar
// persistência de verdade, em vez de apenas contornar a ausência.
if (typeof window !== "undefined" && !window.localStorage) {
  const createStorage = () => {
    let store = new Map();
    return {
      get length() {
        return store.size;
      },
      key: (i) => [...store.keys()][i] ?? null,
      getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
      setItem: (k, v) => void store.set(String(k), String(v)),
      removeItem: (k) => void store.delete(String(k)),
      clear: () => void (store = new Map()),
    };
  };

  for (const name of ["localStorage", "sessionStorage"]) {
    const storage = createStorage();
    Object.defineProperty(window, name, { value: storage, configurable: true });
    Object.defineProperty(globalThis, name, { value: storage, configurable: true });
  }
}
