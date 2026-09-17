/**
 * CRUD completo de ingredientes sobre localStorage.
 *
 * Estructura de cada ingrediente:
 * {
 *   id: string (UUID),
 *   name: string,
 *   unit: 'KG' | 'G' | 'L' | 'ML' | 'UNIDAD',
 *   purchasePrice: number,
 *   purchaseQuantity: number,
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 * }
 */

import { storageRead, storageWrite, KEYS } from "./storageEngine";

function readAll() {
  return storageRead(KEYS.INGREDIENTS, []);
}

function writeAll(ingredients) {
  storageWrite(KEYS.INGREDIENTS, ingredients);
}

export const ingredientStorage = {
  // Devuelve todos los ingredientes ordenados por nombre.
  getAll() {
    return readAll().sort((a, b) => a.name.localeCompare(b.name));
  },

  // Busca un ingrediente por ID. Devuelve undefined si no existe.
  getById(id) {
    return readAll().find((i) => i.id === id);
  },

  // Crea un nuevo ingrediente. Lanza error si ya existe un ingrediente con el mismo nombre.
  create(data) {
    const all = readAll();
    const nameNorm = data.name.trim().toLowerCase();
    const duplicate = all.find((i) => i.name.toLowerCase() === nameNorm);
    if (duplicate) {
      throw new Error(`Ya existe un ingrediente con el nombre "${data.name}".`);
    }

    const now = new Date().toISOString();
    const newIngredient = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      unit: data.unit,
      purchasePrice: Number(data.purchasePrice),
      purchaseQuantity: Number(data.purchaseQuantity),
      createdAt: now,
      updatedAt: now,
    };

    writeAll([...all, newIngredient]);
    return newIngredient;
  },

  // Actualiza un ingrediente existente por ID.
  update(id, data) {
    const all = readAll();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Ingrediente con ID "${id}" no encontrado.`);
    }

    // Verificar duplicado de nombre solo si cambió
    const nameNorm = data.name.trim().toLowerCase();
    const duplicate = all.find(
      (i) => i.name.toLowerCase() === nameNorm && i.id !== id,
    );
    if (duplicate) {
      throw new Error(`Ya existe un ingrediente con el nombre "${data.name}".`);
    }

    const updated = {
      ...all[index],
      name: data.name.trim(),
      unit: data.unit,
      purchasePrice: Number(data.purchasePrice),
      purchaseQuantity: Number(data.purchaseQuantity),
      updatedAt: new Date().toISOString(),
    };

    const newAll = [...all];
    newAll[index] = updated;
    writeAll(newAll);
    return updated;
  },

  // Elimina un ingrediente por ID. Devuelve true si se eliminó, false si no se encontró.
  delete(id) {
    const all = readAll();
    const filtered = all.filter((i) => i.id !== id);
    if (filtered.length === all.length) return false;
    writeAll(filtered);
    return true;
  },
};
