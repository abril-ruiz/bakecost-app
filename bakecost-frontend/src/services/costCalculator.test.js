/**
 * Tests unitarios para la lógica de cálculo de costos del frontend.
 * Estos tests verifican que la implementación JS produce los mismos
 * resultados que el backend Java (UnitConverter + RecipeService).
 */

import { describe, it, expect } from "vitest";
import {
  convertQuantity,
  calculateIngredientCost,
  calculateRecipeCost,
  calculateMarkup,
} from "./costCalculator";

// ─── convertQuantity ────────────────────────────────────────────────────────

describe("convertQuantity", () => {
  describe("conversiones de peso", () => {
    it("convierte KG a G multiplicando por 1000", () => {
      expect(convertQuantity(1.5, "KG", "G")).toBe(1500);
    });

    it("convierte G a KG dividiendo por 1000", () => {
      expect(convertQuantity(250, "G", "KG")).toBe(0.25);
    });

    it("devuelve el mismo valor si las unidades son iguales (KG)", () => {
      expect(convertQuantity(2, "KG", "KG")).toBe(2);
    });

    it("devuelve el mismo valor si las unidades son iguales (G)", () => {
      expect(convertQuantity(500, "G", "G")).toBe(500);
    });
  });

  describe("conversiones de volumen", () => {
    it("convierte L a ML multiplicando por 1000", () => {
      expect(convertQuantity(0.75, "L", "ML")).toBe(750);
    });

    it("convierte ML a L dividiendo por 1000", () => {
      expect(convertQuantity(500, "ML", "L")).toBe(0.5);
    });

    it("devuelve el mismo valor si las unidades son iguales (L)", () => {
      expect(convertQuantity(1, "L", "L")).toBe(1);
    });
  });

  describe("UNIDAD", () => {
    it("devuelve el mismo valor para UNIDAD a UNIDAD", () => {
      expect(convertQuantity(3, "UNIDAD", "UNIDAD")).toBe(3);
    });
  });

  describe("unidades incompatibles", () => {
    it("lanza error al intentar convertir KG a L", () => {
      expect(() => convertQuantity(1, "KG", "L")).toThrow(
        "Unidades incompatibles",
      );
    });

    it("lanza error al intentar convertir ML a G", () => {
      expect(() => convertQuantity(100, "ML", "G")).toThrow(
        "Unidades incompatibles",
      );
    });

    it("lanza error al intentar convertir KG a UNIDAD", () => {
      expect(() => convertQuantity(1, "KG", "UNIDAD")).toThrow(
        "Unidades incompatibles",
      );
    });

    it("lanza error al intentar convertir UNIDAD a G", () => {
      expect(() => convertQuantity(1, "UNIDAD", "G")).toThrow(
        "Unidades incompatibles",
      );
    });
  });
});

// ─── calculateIngredientCost ─────────────────────────────────────────────────

describe("calculateIngredientCost", () => {
  it("calcula costo cuando unidades de compra y receta coinciden", () => {
    // 1 KG a $1000, usa 1 KG → $1000
    expect(calculateIngredientCost(1000, 1, "KG", 1, "KG")).toBe(1000);
  });

  it("calcula costo con conversión KG → G (caso del ejemplo del backend)", () => {
    // 1 KG a $1800, usa 250 G → $450
    // Equivalente al test del backend: UnitConverterTest.calculateCostProportionalAndRounding
    expect(calculateIngredientCost(1800, 1, "KG", 250, "G")).toBe(450);
  });

  it("calcula costo con conversión G → KG", () => {
    // 1000 G a $1000, usa 0.5 KG → $500
    expect(calculateIngredientCost(1000, 1000, "G", 0.5, "KG")).toBe(500);
  });

  it("redondea correctamente a 2 decimales (HALF_UP)", () => {
    // 3 KG a $1000, usa 1 KG → 333.33 (no 333.3333...)
    // Equivalente al test del backend
    expect(calculateIngredientCost(1000, 3, "KG", 1, "KG")).toBe(333.33);
  });

  it("calcula costo con L y ML", () => {
    // 1 L a $600, usa 250 ML → $150
    expect(calculateIngredientCost(600, 1, "L", 250, "ML")).toBe(150);
  });

  it("calcula costo con UNIDAD directa", () => {
    // 12 huevos a $1200, usa 3 huevos → $300
    expect(calculateIngredientCost(1200, 12, "UNIDAD", 3, "UNIDAD")).toBe(300);
  });

  it("lanza error con unidades incompatibles", () => {
    expect(() => calculateIngredientCost(1000, 1, "KG", 250, "ML")).toThrow(
      "Unidades incompatibles",
    );
  });
});

// ─── calculateRecipeCost ─────────────────────────────────────────────────────

describe("calculateRecipeCost", () => {
  // Receta de prueba válida
  const validRecipe = {
    id: "uuid-test-001",
    name: "Torta de Chocolate",
    yield: 10,
    preparationHours: 2,
    indirectCostPercentage: 10,
    ingredients: [
      {
        ingredientName: "Harina",
        purchasePrice: 1000,
        purchaseQuantity: 1,
        purchaseUnit: "KG",
        quantity: 500,
        recipeUnit: "G",
      },
      {
        ingredientName: "Azúcar",
        purchasePrice: 1800,
        purchaseQuantity: 1,
        purchaseUnit: "KG",
        quantity: 250,
        recipeUnit: "G",
      },
    ],
  };

  it("calcula correctamente los costos base", () => {
    const result = calculateRecipeCost(validRecipe, 7000, 0);
    expect(result.ingredientCost).toBe(950); // 500 + 450
    expect(result.laborCost).toBe(14000); // 2 * 7000
    expect(result.indirectCost).toBe(1495); // 10% de (950 + 14000)
    expect(result.totalCost).toBe(16445);
  });

  it("debe lanzar error si el rendimiento es 0 o menor (protección de negocio)", () => {
    const recipeWithZeroYield = { ...validRecipe, yield: 0 };
    expect(() => calculateRecipeCost(recipeWithZeroYield, 7000, 50)).toThrow(
      "El rendimiento debe ser mayor a 0.",
    );
  });

  it("calcula costo por unidad correctamente", () => {
    // $16445 / 10 unidades = $1644.50
    const result = calculateRecipeCost(validRecipe, 7000, 0);
    expect(result.costPerUnit).toBe(1644.5);
  });

  it("incluye el desglose de ingredientes con el nombre correcto", () => {
    const result = calculateRecipeCost(validRecipe, 7000, 0);
    expect(result.ingredientDetails).toHaveLength(2);
    expect(result.ingredientDetails[0].ingredientName).toBe("Harina");
    expect(result.ingredientDetails[0].cost).toBe(500);
    expect(result.ingredientDetails[1].ingredientName).toBe("Azúcar");
    expect(result.ingredientDetails[1].cost).toBe(450);
  });

  it("preserva el id y nombre de la receta en el resultado", () => {
    const result = calculateRecipeCost(validRecipe, 7000, 0);
    expect(result.recipeId).toBe("uuid-test-001");
    expect(result.recipeName).toBe("Torta de Chocolate");
    expect(result.yield).toBe(10);
  });

  it("funciona con laborCostPerHour = 0 (sin mano de obra)", () => {
    const result = calculateRecipeCost(validRecipe, 0, 0);
    expect(result.laborCost).toBe(0);
    // Total = ingredientCost + 0 + (ingredientCost * 0.10)
    expect(result.ingredientCost).toBe(950);
    expect(result.indirectCost).toBe(95);
    expect(result.totalCost).toBe(1045);
    expect(result.costPerUnit).toBe(104.5);
  });

  it("funciona con indirectCostPercentage = 0", () => {
    const recipe = { ...validRecipe, indirectCostPercentage: 0 };
    const result = calculateRecipeCost(recipe, 7000, 0);
    expect(result.indirectCost).toBe(0);
    // Total = 950 + 14000 + 0 = 14950
    expect(result.totalCost).toBe(14950);
  });

  it("maneja ingrediente con unidades incompatibles sin romper (registra costo 0)", () => {
    const recipe = {
      ...validRecipe,
      ingredients: [
        {
          ingredientName: "Ingrediente inválido",
          purchasePrice: 1000,
          purchaseQuantity: 1,
          purchaseUnit: "KG",
          quantity: 100,
          recipeUnit: "ML", // incompatible con KG
        },
      ],
    };
    // No debe lanzar error — registra costo 0 para ese ingrediente
    const result = calculateRecipeCost(recipe, 0);
    expect(result.ingredientDetails[0].cost).toBe(0);
    expect(result.ingredientCost).toBe(0);
  });

  it("los resultados del frontend son consistentes con los del backend (caso de referencia)", () => {
    // Este test es la línea directa de verificación entre frontend y backend.
    // Los valores esperados son los mismos que en CostCalculationServiceTest.java.
    const result = calculateRecipeCost(validRecipe, 7000);
    expect(result.ingredientCost).toBe(950.0);
    expect(result.laborCost).toBe(14000.0);
    expect(result.indirectCost).toBe(1495.0);
    expect(result.totalCost).toBe(16445.0);
    expect(result.costPerUnit).toBe(1644.5);
  });
});

// ─── calculateMarkup ───────────────────────────────────────────────────────
describe("calculateMarkup", () => {
  it("debe calcular correctamente con markup del 50%", () => {
    // Costo = 100, Markup = 50%. Precio Venta = 100 * 1.50 = 150
    const result = calculateMarkup(100, 50, 10);
    expect(result.sellingPrice).toBe(150);
    expect(result.profit).toBe(50);
    expect(result.sellingPricePerUnit).toBe(15);
  });

  it("debe calcular correctamente con markup del 100%", () => {
    // Costo = 100, Markup = 100%. Precio Venta = 100 * 2 = 200
    const result = calculateMarkup(100, 100, 5);
    expect(result.sellingPrice).toBe(200);
    expect(result.profit).toBe(100);
    expect(result.sellingPricePerUnit).toBe(40);
  });

  it("debe calcular correctamente con markup del 200%", () => {
    // Costo = 100, Markup = 200%. Precio Venta = 100 * 3 = 300
    const result = calculateMarkup(100, 200, 10);
    expect(result.sellingPrice).toBe(300);
    expect(result.profit).toBe(200);
    expect(result.sellingPricePerUnit).toBe(30);
  });

  it("debe aceptar markup de 0% (precio igual al costo)", () => {
    const result = calculateMarkup(100, 0, 10);
    expect(result.sellingPrice).toBe(100);
    expect(result.profit).toBe(0);
    expect(result.sellingPricePerUnit).toBe(10);
  });

  it("debe lanzar error si el markup es negativo", () => {
    expect(() => calculateMarkup(100, -10, 10)).toThrow(
      "El sobreprecio no puede ser negativo.",
    );
  });
  it("debe lanzar error si el rendimiento es <= 0", () => {
    expect(() => calculateMarkup(100, 50, 0)).toThrow(
      "El rendimiento debe ser mayor a 0.",
    );
  });
});
