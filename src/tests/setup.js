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
    const storage = {};

    Object.defineProperties(storage, {
      length: {
        configurable: true,
        get: () => store.size,
      },
      key: {
        configurable: true,
        writable: true,
        value: (i) => [...store.keys()][i] ?? null,
      },
      getItem: {
        configurable: true,
        writable: true,
        value: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
      },
      setItem: {
        configurable: true,
        writable: true,
        value: (key, value) => {
          const normalizedKey = String(key);
          const normalizedValue = String(value);
          store.set(normalizedKey, normalizedValue);
          Object.defineProperty(storage, normalizedKey, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: normalizedValue,
          });
        },
      },
      removeItem: {
        configurable: true,
        writable: true,
        value: (key) => {
          const normalizedKey = String(key);
          store.delete(normalizedKey);
          delete storage[normalizedKey];
        },
      },
      clear: {
        configurable: true,
        writable: true,
        value: () => {
          for (const key of store.keys()) delete storage[key];
          store = new Map();
        },
      },
    });

    return storage;
  };

  for (const name of ["localStorage", "sessionStorage"]) {
    const storage = createStorage();
    Object.defineProperty(window, name, { value: storage, configurable: true });
    Object.defineProperty(globalThis, name, { value: storage, configurable: true });
  }
}
