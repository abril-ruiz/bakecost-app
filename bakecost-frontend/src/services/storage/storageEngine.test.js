// ── MOCK DE LOCALSTORAGE PARA VITEST ──
// Simula el comportamiento de localStorage en un entorno de pruebas (Node.js)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Se define window y localStorage en el entorno global de Node/Vitest
global.window = global.window || global;
global.window.localStorage = localStorageMock;
global.localStorage = localStorageMock;

//Tests unitarios para la capa de acceso a localStorage.
import { describe, it, expect, beforeEach } from "vitest";
import {
  storageRead,
  storageWrite,
  storageRemove,
  KEYS,
} from "./storageEngine";

const TEST_KEY = "bakecost_test_key";

beforeEach(() => {
  localStorage.clear();
});

// storageRead
describe("storageRead", () => {
  it("devuelve defaultValue cuando la clave no existe", () => {
    expect(storageRead("clave_inexistente", [])).toEqual([]);
    expect(storageRead("clave_inexistente", null)).toBeNull();
    expect(storageRead("clave_inexistente", 42)).toBe(42);
  });

  it("parsea correctamente un array JSON guardado", () => {
    localStorage.setItem(
      TEST_KEY,
      JSON.stringify([{ id: "1", name: "Harina" }]),
    );
    const result = storageRead(TEST_KEY, []);
    expect(result).toEqual([{ id: "1", name: "Harina" }]);
  });

  it("parsea correctamente un objeto JSON guardado", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify({ laborCostPerHour: 1500 }));
    const result = storageRead(TEST_KEY, {});
    expect(result).toEqual({ laborCostPerHour: 1500 });
  });

  it("devuelve defaultValue cuando el JSON está corrupto", () => {
    localStorage.setItem(TEST_KEY, "esto_no_es_json_valido{{{");
    const result = storageRead(TEST_KEY, []);
    expect(result).toEqual([]);
  });

  it("devuelve defaultValue cuando el valor es null en localStorage", () => {
    // localStorage.getItem retorna null para claves inexistentes
    const result = storageRead("clave_que_no_existe", "default");
    expect(result).toBe("default");
  });

  it("parsea correctamente valores primitivos (number)", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify(42));
    expect(storageRead(TEST_KEY, 0)).toBe(42);
  });

  it("parsea correctamente un array vacío", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify([]));
    expect(storageRead(TEST_KEY, null)).toEqual([]);
  });
});

// ─── storageWrite ─────────────────────────────────────────────────────────────

describe("storageWrite", () => {
  it("serializa y guarda un array correctamente", () => {
    const data = [{ id: "uuid-1", name: "Azúcar" }];
    storageWrite(TEST_KEY, data);
    expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(data));
  });

  it("serializa y guarda un objeto correctamente", () => {
    const data = { laborCostPerHour: 2000 };
    storageWrite(TEST_KEY, data);
    expect(JSON.parse(localStorage.getItem(TEST_KEY))).toEqual(data);
  });

  it("sobreescribe datos anteriores", () => {
    storageWrite(TEST_KEY, [1, 2, 3]);
    storageWrite(TEST_KEY, [4, 5, 6]);
    expect(storageRead(TEST_KEY, [])).toEqual([4, 5, 6]);
  });

  it("puede guardar un array vacío", () => {
    storageWrite(TEST_KEY, []);
    expect(storageRead(TEST_KEY, null)).toEqual([]);
  });
});

// ─── storageRemove
describe("storageRemove", () => {
  it("elimina la clave del localStorage", () => {
    localStorage.setItem(TEST_KEY, "valor");
    storageRemove(TEST_KEY);
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it("no lanza error al intentar eliminar una clave inexistente", () => {
    expect(() => storageRemove("clave_que_no_existe")).not.toThrow();
  });
});

// ─── round trip
describe("round trip (write → read)", () => {
  it("escribe y lee datos complejos sin pérdida", () => {
    const ingredient = {
      id: "uuid-abc123",
      name: "Harina 000",
      unit: "KG",
      purchasePrice: 1500.5,
      purchaseQuantity: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    storageWrite(KEYS.INGREDIENTS, [ingredient]);
    const result = storageRead(KEYS.INGREDIENTS, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(ingredient);
  });
});
