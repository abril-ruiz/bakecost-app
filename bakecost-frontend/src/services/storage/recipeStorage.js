// CRUD de recetas en localStorage. No se encarga de validar los datos.
import { storageRead, storageWrite, KEYS } from "./storageEngine";

function readAll() {
  return storageRead(KEYS.RECIPES, []);
}

function writeAll(recipes) {
  storageWrite(KEYS.RECIPES, recipes);
}

export const recipeStorage = {
  // Devuelve todas las recetas ordenadas por fecha de creación descendente.
  getAll() {
    return readAll().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  },

  // Busca una receta por ID.
  getById(id) {
    return readAll().find((r) => r.id === id);
  },

  // Crea una receta nueva con snapshot de ingredientes.
  create(data) {
    const now = new Date().toISOString();
    const newRecipe = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      category: data.category,
      yield: Number(data.yield),
      preparationHours: Number(data.preparationHours),
      indirectCostPercentage: Number(data.indirectCostPercentage),
      // Los ingredientes vienen ya con snapshot desde recipeService
      ingredients: data.ingredients ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const all = readAll();
    writeAll([...all, newRecipe]);
    return newRecipe;
  },

  // Actualiza una receta existente.
  update(id, data) {
    const all = readAll();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Receta con ID "${id}" no encontrada.`);
    }

    const updated = {
      ...all[index],
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      category: data.category,
      yield: Number(data.yield),
      preparationHours: Number(data.preparationHours),
      indirectCostPercentage: Number(data.indirectCostPercentage),
      ingredients: data.ingredients ?? all[index].ingredients,
      updatedAt: new Date().toISOString(),
    };

    const newAll = [...all];
    newAll[index] = updated;
    writeAll(newAll);
    return updated;
  },

  // Elimina una receta por ID.
  delete(id) {
    const all = readAll();
    const filtered = all.filter((r) => r.id !== id);
    if (filtered.length === all.length) return false;
    writeAll(filtered);
    return true;
  },
};
