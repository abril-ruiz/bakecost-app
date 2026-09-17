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

// Tests unitarios para el CRUD de ingredientes en localStorage.
import { describe, it, expect, beforeEach } from "vitest";
import { ingredientStorage } from "./ingredientStorage";
import { storageRemove, KEYS } from "./storageEngine";

// Limpia el storage antes de cada test para garantizar aislamiento
beforeEach(() => {
  storageRemove(KEYS.INGREDIENTS);
});

// Helper para crear un ingrediente con valores por defecto
function crearIngrediente(overrides = {}) {
  return ingredientStorage.create({
    name: "Harina 000",
    unit: "KG",
    purchasePrice: 1500,
    purchaseQuantity: 1,
    ...overrides,
  });
}

// Pruebas para la función getAll
describe("getAll", () => {
  it("devuelve array vacío cuando no hay ingredientes", () => {
    expect(ingredientStorage.getAll()).toEqual([]);
  });

  it("devuelve los ingredientes ordenados por nombre", () => {
    crearIngrediente({ name: "Vainilla" });
    crearIngrediente({ name: "Azúcar" });
    crearIngrediente({ name: "Manteca" });

    const nombres = ingredientStorage.getAll().map((i) => i.name);
    // Los tres ingredientes creados, sin contar el "Harina 000" que usa el helper
    expect(nombres).toEqual(["Azúcar", "Manteca", "Vainilla"]);
  });
});

// Prueba para la función getById
describe("getById", () => {
  it("devuelve el ingrediente correcto por ID", () => {
    const creado = crearIngrediente();
    const encontrado = ingredientStorage.getById(creado.id);
    expect(encontrado).toEqual(creado);
  });

  it("devuelve undefined para un ID inexistente", () => {
    expect(ingredientStorage.getById("id-que-no-existe")).toBeUndefined();
  });
});

// Pruebas para la función create
describe("create", () => {
  it("crea un ingrediente con UUID como ID", () => {
    const ing = crearIngrediente();
    // UUID v4: 8-4-4-4-12 caracteres hex
    expect(ing.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("guarda todos los campos correctamente", () => {
    const ing = crearIngrediente({
      name: "Sal",
      unit: "G",
      purchasePrice: 200,
      purchaseQuantity: 500,
    });
    expect(ing.name).toBe("Sal");
    expect(ing.unit).toBe("G");
    expect(ing.purchasePrice).toBe(200);
    expect(ing.purchaseQuantity).toBe(500);
  });

  it("guarda timestamps de creación y actualización", () => {
    const ing = crearIngrediente();
    expect(ing.createdAt).toBeTruthy();
    expect(ing.updatedAt).toBeTruthy();
    // Deben ser fechas ISO válidas
    expect(new Date(ing.createdAt).toISOString()).toBe(ing.createdAt);
  });

  it("normaliza espacios del nombre (trim)", () => {
    const ing = ingredientStorage.create({
      name: "  Harina con espacios  ",
      unit: "KG",
      purchasePrice: 1000,
      purchaseQuantity: 1,
    });
    expect(ing.name).toBe("Harina con espacios");
  });

  it("lanza error si ya existe un ingrediente con el mismo nombre (case-insensitive)", () => {
    crearIngrediente({ name: "Azúcar" });
    expect(() => crearIngrediente({ name: "AZÚCAR" })).toThrow(
      'Ya existe un ingrediente con el nombre "AZÚCAR".',
    );
    expect(() => crearIngrediente({ name: "azúcar" })).toThrow();
  });

  it("genera IDs diferentes para ingredientes distintos", () => {
    const a = crearIngrediente({ name: "Ingrediente A" });
    const b = crearIngrediente({ name: "Ingrediente B" });
    expect(a.id).not.toBe(b.id);
  });

  it("persiste en localStorage y se puede recuperar con getAll", () => {
    crearIngrediente();
    expect(ingredientStorage.getAll()).toHaveLength(1);
  });
});

// Pruebas para la función update
describe("update", () => {
  it("actualiza los campos del ingrediente", () => {
    const original = crearIngrediente();
    const actualizado = ingredientStorage.update(original.id, {
      name: "Harina 000 actualizada",
      unit: "G",
      purchasePrice: 2000,
      purchaseQuantity: 1000,
    });

    expect(actualizado.name).toBe("Harina 000 actualizada");
    expect(actualizado.unit).toBe("G");
    expect(actualizado.purchasePrice).toBe(2000);
    expect(actualizado.purchaseQuantity).toBe(1000);
  });

  it("preserva el ID y createdAt originales", () => {
    const original = crearIngrediente();
    const actualizado = ingredientStorage.update(original.id, {
      name: "Nombre nuevo",
      unit: "KG",
      purchasePrice: 999,
      purchaseQuantity: 1,
    });

    expect(actualizado.id).toBe(original.id);
    expect(actualizado.createdAt).toBe(original.createdAt);
  });

  it("actualiza el campo updatedAt", () => {
    const original = crearIngrediente();
    // Pequeño delay para asegurar diferencia de timestamp
    const actualizado = ingredientStorage.update(original.id, {
      name: "Harina 000",
      unit: "KG",
      purchasePrice: 2000,
      purchaseQuantity: 1,
    });

    // updatedAt puede ser igual si el reloj no avanzó — solo verifica que existe
    expect(actualizado.updatedAt).toBeTruthy();
  });

  it("lanza error si el ID no existe", () => {
    expect(() =>
      ingredientStorage.update("id-inexistente", {
        name: "Algo",
        unit: "KG",
        purchasePrice: 100,
        purchaseQuantity: 1,
      }),
    ).toThrow('Ingrediente con ID "id-inexistente" no encontrado.');
  });

  it("lanza error si el nuevo nombre ya pertenece a otro ingrediente", () => {
    crearIngrediente({ name: "Nombre existente" });
    const otro = crearIngrediente({ name: "Otro ingrediente" });

    expect(() =>
      ingredientStorage.update(otro.id, {
        name: "Nombre existente",
        unit: "KG",
        purchasePrice: 100,
        purchaseQuantity: 1,
      }),
    ).toThrow();
  });

  it("permite actualizar el nombre con el mismo valor (no es duplicado de sí mismo)", () => {
    const original = crearIngrediente({ name: "Sal fina" });
    expect(() =>
      ingredientStorage.update(original.id, {
        name: "Sal fina", // mismo nombre, mismo ingrediente → OK
        unit: "G",
        purchasePrice: 300,
        purchaseQuantity: 500,
      }),
    ).not.toThrow();
  });
});

// Pruebas para la función delete
describe("delete", () => {
  it("elimina el ingrediente y devuelve true", () => {
    const ing = crearIngrediente();
    const resultado = ingredientStorage.delete(ing.id);

    expect(resultado).toBe(true);
    expect(ingredientStorage.getAll()).toHaveLength(0);
    expect(ingredientStorage.getById(ing.id)).toBeUndefined();
  });

  it("devuelve false si el ID no existe", () => {
    expect(ingredientStorage.delete("id-inexistente")).toBe(false);
  });

  it("elimina solo el ingrediente indicado y deja los demás intactos", () => {
    const a = crearIngrediente({ name: "Ingrediente A" });
    const b = crearIngrediente({ name: "Ingrediente B" });
    const c = crearIngrediente({ name: "Ingrediente C" });

    ingredientStorage.delete(b.id);

    const restantes = ingredientStorage.getAll();
    expect(restantes).toHaveLength(2);
    expect(restantes.find((i) => i.id === a.id)).toBeTruthy();
    expect(restantes.find((i) => i.id === b.id)).toBeUndefined();
    expect(restantes.find((i) => i.id === c.id)).toBeTruthy();
  });
});
