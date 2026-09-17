//Lógica de cálculo de costos de recetas para el frontend (V1).

// -- Conversión de unidades (Espejo de: UnitConverter.convertQuantity()) --
const WEIGHT_UNITS = new Set(["KG", "G"]);
const VOLUME_UNITS = new Set(["L", "ML"]);

/**
 * Verifica si dos unidades son compatibles para conversión.
 * UNIDAD solo es compatible consigo misma.
 */
function areCompatible(from, to) {
  if (from === to) return true;
  if (WEIGHT_UNITS.has(from) && WEIGHT_UNITS.has(to)) return true;
  if (VOLUME_UNITS.has(from) && VOLUME_UNITS.has(to)) return true;
  return false;
}

// Convierte una cantidad de una unidad a otra.
export function convertQuantity(quantity, from, to) {
  if (from === to) return quantity;

  if (!areCompatible(from, to)) {
    throw new Error(
      `No se puede convertir de ${from} a ${to}. Unidades incompatibles.`,
    );
  }

  if (from === "KG" && to === "G") return quantity * 1000;
  if (from === "G" && to === "KG") return quantity / 1000;
  if (from === "L" && to === "ML") return quantity * 1000;
  if (from === "ML" && to === "L") return quantity / 1000;

  throw new Error(`Conversión no soportada entre ${from} y ${to}`);
}

// -- Costo de un ingrediente individual (Espejo de: UnitConverter.calculateCost()) --
// Calcula el costo de usar un ingrediente en una receta.
export function calculateIngredientCost(
  purchasePrice,
  purchaseQuantity,
  purchaseUnit,
  recipeQuantity,
  recipeUnit,
) {
  // Convertir la cantidad de la receta a la unidad de compra
  const convertedQty = convertQuantity(
    recipeQuantity,
    recipeUnit,
    purchaseUnit,
  );

  // Precio por unidad de compra (ej: precio por 1 KG)
  const unitCost = purchasePrice / purchaseQuantity;

  // Costo final = precio unitario × cantidad convertida
  return round2(unitCost * convertedQty);
}

// -- Cálculo completo de costo de receta (Espejo de: RecipeService.calculateRecipeCost()) --

// Calcula el costo completo de una receta.
export function calculateRecipeCost(
  recipe,
  laborCostPerHour,
  profitMarginPercentage = 30,
) {
  // 1. Costo de ingredientes
  let ingredientCost = 0;
  const ingredientDetails = [];

  for (const ri of recipe.ingredients) {
    let cost;
    try {
      cost = calculateIngredientCost(
        ri.purchasePrice,
        ri.purchaseQuantity,
        ri.purchaseUnit,
        ri.quantity,
        ri.recipeUnit,
      );
    } catch (err) {
      console.warn(
        `[costCalculator] ${err.message} — ingrediente: ${ri.ingredientName}`,
      );
      cost = 0;
    }

    ingredientCost += cost;
    ingredientDetails.push({
      ingredientName: ri.ingredientName,
      quantityUsed: ri.quantity,
      unitUsed: ri.recipeUnit,
      cost,
    });
  }

  ingredientCost = round2(ingredientCost);

  // 2. Costo de mano de obra
  const laborCost = round2(recipe.preparationHours * (laborCostPerHour ?? 0));

  // 3. Costos indirectos
  const subtotal = ingredientCost + laborCost;
  const indirectCost = round2(subtotal * (recipe.indirectCostPercentage / 100));

  // 4. Total y costo por unidad
  const totalCost = round2(ingredientCost + laborCost + indirectCost);
  const costPerUnit = recipe.yield > 0 ? round2(totalCost / recipe.yield) : 0;

  // 5. Cálculo de Margen de Ganancia
  const marginData = calculateMarkup(
    totalCost,
    profitMarginPercentage,
    recipe.yield,
  );

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    yield: recipe.yield,
    ingredientCost,
    laborCost,
    indirectCost,
    totalCost,
    costPerUnit,
    ingredientDetails,
    // Nuevos campos de margen
    profitMarginPercentage,
    sellingPrice: marginData.sellingPrice,
    profit: marginData.profit,
    sellingPricePerUnit: marginData.sellingPricePerUnit,
  };
}

// -- Utilidad interna --
// Redondea a 2 decimales
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el sobreprecio (markup), precio de venta y ganancia estimada.
 * Fórmula: Markup sobre el costo
 */
export function calculateMarkup(totalCost, markupPercentage, yieldCount) {
  if (markupPercentage < 0) {
    throw new Error("El sobreprecio no puede ser negativo.");
  }
  if (yieldCount <= 0) {
    throw new Error("El rendimiento debe ser mayor a 0.");
  }

  const markupDecimal = markupPercentage / 100;
  const sellingPrice = totalCost * (1 + markupDecimal);
  const profit = totalCost * markupDecimal;
  const sellingPricePerUnit = sellingPrice / yieldCount;

  return {
    sellingPrice: round2(sellingPrice),
    profit: round2(profit),
    sellingPricePerUnit: round2(sellingPricePerUnit),
  };
}
