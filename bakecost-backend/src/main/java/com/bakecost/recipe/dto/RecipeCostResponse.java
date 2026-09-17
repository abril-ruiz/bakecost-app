package com.bakecost.recipe.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

// DTO para la respuesta del cálculo de costos de una receta
@Data @Builder
public class RecipeCostResponse {
    private Long recipeId;
    private String recipeName;
    private Integer yield;          // Cantidad de unidades que produce la receta

    private BigDecimal ingredientCost;      // Suma de todos los ingredientes
    private BigDecimal laborCost;           // Horas * valor hora
    private BigDecimal indirectCost;        // % sobre (ingredientes + mano de obra)
    private BigDecimal totalCost;           // ingredientCost + laborCost + indirectCost
    private BigDecimal costPerUnit;         // totalCost / yield

    /**
     * Campos de margen de ganancia (opcionales — presentes solo si se envió profitMarginPercentage > 0).
     * Calcula el precio de venta y la ganancia estimada según el margen de ganancia proporcionado.
     * Formula: sellingPrice = totalCost * (1 + profitMarginPercentage / 100)
     * 
     */
    private BigDecimal profitMarginPercentage;  // El porcentaje recibido, reflejado en la respuesta
    private BigDecimal estimatedProfit;         // Ganancia total estimada
    private BigDecimal sellingPrice;            // Precio de venta total
    private BigDecimal sellingPricePerUnit;     // Precio de venta por unidad producida

    private List<IngredientCostDetail> ingredientDetails;

    // Calculo de costos detallado por ingrediente
    @Data @Builder
    public static class IngredientCostDetail {
        private String ingredientName;
        private BigDecimal quantityUsed;
        private String unitUsed;
        private BigDecimal cost;
    }
}