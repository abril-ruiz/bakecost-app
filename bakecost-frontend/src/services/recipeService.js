/**
 * Servicio de alto nivel para recetas.
 *
 * Decisión de diseño — snapshot de ingredientes:
 * Al crear una receta, este servicio resuelve cada ingrediente desde
 * ingredientStorage y guarda un snapshot de sus datos de compra.
 * Esto garantiza que el cálculo de costos sea reproducible aunque el
 * usuario edite o elimine un ingrediente posteriormente.
 */
import { recipeStorage, ingredientStorage } from "./storage";
import { calculateRecipeCost } from "./costCalculator";
import { settingsStorage } from "./storage";

export const recipeService = {
  // Devuelve todas las recetas ordenadas por fecha de creación descendente.
  getAll() {
    return Promise.resolve(recipeStorage.getAll());
  },

  // Busca una receta por ID. Rechaza si no existe.
  getById(id) {
    const recipe = recipeStorage.getById(id);
    if (!recipe) {
      return Promise.reject(new Error(`Receta con ID "${id}" no encontrada.`));
    }
    return Promise.resolve(recipe);
  },

  /**
   * Crea una receta nueva.
   * Resuelve cada ingredientId a su entidad completa y guarda snapshot.
   */
  create(data) {
    try {
      // Validaciones básicas (espejo de RecipeService.validateRecipeRequest)
      if (!data.yield || Number(data.yield) <= 0) {
        throw new Error("El rendimiento debe ser mayor a cero.");
      }
      if (Number(data.preparationHours) <= 0) {
        throw new Error("El tiempo de preparación debe ser mayor a cero.");
      }
      if (Number(data.indirectCostPercentage) < 0) {
        throw new Error(
          "El porcentaje de costos indirectos no puede ser negativo.",
        );
      }
      if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error("La receta debe tener al menos un ingrediente.");
      }

      // Construir ingredientes con snapshot
      const ingredientsWithSnapshot = data.ingredients.map((ing) => {
        const ingredient = ingredientStorage.getById(ing.ingredientId);
        if (!ingredient) {
          throw new Error(
            `Ingrediente con ID "${ing.ingredientId}" no encontrado.`,
          );
        }
        return {
          ingredientId: ingredient.id,
          ingredientName: ingredient.name, // snapshot
          purchasePrice: ingredient.purchasePrice, // snapshot
          purchaseQuantity: ingredient.purchaseQuantity, // snapshot
          purchaseUnit: ingredient.unit, // snapshot
          quantity: Number(ing.quantity),
          recipeUnit: ing.recipeUnit,
        };
      });

      const created = recipeStorage.create({
        ...data,
        ingredients: ingredientsWithSnapshot,
      });

      return Promise.resolve(created);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Actualiza una receta existente.
   * Reconstruye los snapshots de ingredientes con los precios actuales.
   */
  update(id, data) {
    try {
      const ingredientsWithSnapshot = data.ingredients.map((ing) => {
        const ingredient = ingredientStorage.getById(ing.ingredientId);
        if (!ingredient) {
          throw new Error(
            `Ingrediente con ID "${ing.ingredientId}" no encontrado.`,
          );
        }
        return {
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          purchasePrice: ingredient.purchasePrice,
          purchaseQuantity: ingredient.purchaseQuantity,
          purchaseUnit: ingredient.unit,
          quantity: Number(ing.quantity),
          recipeUnit: ing.recipeUnit,
        };
      });

      const updated = recipeStorage.update(id, {
        ...data,
        ingredients: ingredientsWithSnapshot,
      });

      return Promise.resolve(updated);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // Elimina una receta por ID.
  delete(id) {
    recipeStorage.delete(id);
    return Promise.resolve();
  },

  /**
   * Calcula el costo completo de una receta.
   * Usa el snapshot de ingredientes guardado + el valor hora actual de settings.
   */
  calculateCost(id) {
    const recipe = recipeStorage.getById(id);
    if (!recipe) {
      return Promise.reject(new Error(`Receta con ID "${id}" no encontrada.`));
    }
    // 1. Refrescar snapshots con los precios actuales de ingredientStorage
    const freshIngredients = recipe.ingredients.map((ri) => {
      const currentIngredient = ingredientStorage.getById(ri.ingredientId);
      if (currentIngredient) {
        return {
          ...ri,
          purchasePrice: currentIngredient.purchasePrice,
          purchaseQuantity: currentIngredient.purchaseQuantity,
          purchaseUnit: currentIngredient.unit,
        };
      }
      return ri; // Fallback al snapshot si el ingrediente fue eliminado
    });
    const freshRecipe = { ...recipe, ingredients: freshIngredients };
    const laborCostPerHour = settingsStorage.getLaborCostPerHour();

    // Usamos el margen guardado en la receta, o 30% por defecto
    const margin = recipe.profitMarginPercentage || 30;

    // 2. Calcular con los datos frescos
    const result = calculateRecipeCost(freshRecipe, laborCostPerHour, margin);
    return Promise.resolve(result);
  },
};
