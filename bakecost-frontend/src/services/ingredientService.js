// Servicio de ingredientes del frontend.
// Se encarga de la validación y de la comunicación con el almacenamiento local.
import { ingredientStorage } from "./storage";

export const ingredientService = {
  // Devuelve todos los ingredientes ordenados por nombre.
  getAll() {
    return Promise.resolve(ingredientStorage.getAll());
  },

  // Busca un ingrediente por ID. Rechaza si no existe.
  getById(id) {
    const ingredient = ingredientStorage.getById(id);
    if (!ingredient) {
      return Promise.reject(
        new Error(`Ingrediente con ID "${id}" no encontrado.`),
      );
    }
    return Promise.resolve(ingredient);
  },

  // Crea un ingrediente nuevo. Rechaza si ya existe otro con el mismo nombre.
  create(data) {
    try {
      const created = ingredientStorage.create(data);
      return Promise.resolve(created);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // Actualiza un ingrediente existente. Rechaza si no existe o si el nuevo nombre ya está en uso.
  update(id, data) {
    try {
      const updated = ingredientStorage.update(id, data);
      return Promise.resolve(updated);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Elimina un ingrediente por ID.
   * Nota: las recetas que lo usan conservan el snapshot y siguen siendo calculables.
   */
  delete(id) {
    ingredientStorage.delete(id);
    return Promise.resolve();
  },
};
