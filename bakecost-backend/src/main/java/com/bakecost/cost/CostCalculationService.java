package com.bakecost.cost;

import com.bakecost.cost.dto.CostCalculationRequest;
import com.bakecost.cost.dto.IngredientCostInput;
import com.bakecost.ingredient.UnitConverter;
import com.bakecost.recipe.dto.RecipeCostResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de cálculo de costos STATELESS para la V1 de BakeCost.
 *
 * Recibe todos los datos necesarios en el request y devuelve el desglose
 * completo sin leer ni escribir nada en la base de datos.
 *
 */
@Service
public class CostCalculationService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final UnitConverter unitConverter;

    public CostCalculationService(UnitConverter unitConverter) {
        this.unitConverter = unitConverter;
    }

    /**
     * Calcula el costo completo de una receta a partir de los datos recibidos.
     * Si el request incluye profitMarginPercentage > 0, calcula además el
     * precio de venta, ganancia estimada y precio por unidad de venta.
     */
    public RecipeCostResponse calculate(CostCalculationRequest request) {
        validateRequest(request);

        BigDecimal ingredientCost = BigDecimal.ZERO;
        List<RecipeCostResponse.IngredientCostDetail> details = new ArrayList<>();

        // 1. Costo de cada ingrediente
        for (IngredientCostInput ing : request.getIngredients()) {
            validateIngredient(ing);
            BigDecimal cost = unitConverter.calculateCost(
                    ing.getPurchasePrice(),
                    ing.getPurchaseQuantity(),
                    ing.getPurchaseUnit(),
                    ing.getQuantity(),
                    ing.getRecipeUnit()
            );
            ingredientCost = ingredientCost.add(cost);
            details.add(RecipeCostResponse.IngredientCostDetail.builder()
                    .ingredientName(ing.getIngredientName())
                    .quantityUsed(ing.getQuantity())
                    .unitUsed(ing.getRecipeUnit().name())
                    .cost(cost)
                    .build());
        }

        // 2. Costo de mano de obra: horas × valor hora
        BigDecimal laborCostPerHour = request.getLaborCostPerHour() != null
                ? request.getLaborCostPerHour()
                : BigDecimal.ZERO;
        BigDecimal laborCost = request.getPreparationHours()
                .multiply(laborCostPerHour)
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Costos indirectos: % sobre (ingredientes + mano de obra)
        BigDecimal subtotal = ingredientCost.add(laborCost);
        BigDecimal indirectCost = subtotal
                .multiply(request.getIndirectCostPercentage())
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        // 4. Total y costo por unidad
        BigDecimal totalCost = subtotal.add(indirectCost);
        BigDecimal costPerUnit = totalCost.divide(
                new BigDecimal(request.getYield()), 2, RoundingMode.HALF_UP);

        // 5. Ganancia / Markup (opcional)
        //    Se calcula si profitMarginPercentage está presente y es >= 0.
        BigDecimal markup = request.getProfitMarginPercentage();
        BigDecimal sellingPrice = null;
        BigDecimal estimatedProfit = null;
        BigDecimal sellingPricePerUnit = null;

        if (markup != null && markup.compareTo(BigDecimal.ZERO) >= 0) {
            // sellingPrice = totalCost * (1 + markup/100)
            BigDecimal markupDecimal = markup.divide(ONE_HUNDRED, 10, RoundingMode.HALF_UP);
            BigDecimal multiplier = BigDecimal.ONE.add(markupDecimal);
            
            sellingPrice = totalCost.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
            estimatedProfit = sellingPrice.subtract(totalCost);
            sellingPricePerUnit = sellingPrice.divide(
                    new BigDecimal(request.getYield()), 2, RoundingMode.HALF_UP);
        }


        return RecipeCostResponse.builder()
                .recipeId(null)
                .recipeName(request.getRecipeName())
                .yield(request.getYield())
                .ingredientCost(ingredientCost)
                .laborCost(laborCost)
                .indirectCost(indirectCost)
                .totalCost(totalCost)
                .costPerUnit(costPerUnit)
                // Campos de markup — null si no se solicitó margen
                .profitMarginPercentage(markup)
                .sellingPrice(sellingPrice)
                .estimatedProfit(estimatedProfit)
                .sellingPricePerUnit(sellingPricePerUnit)
                .ingredientDetails(details)
                .build();
    }

    // ── Validaciones ────────────────────────────────────────────────────────

    private void validateRequest(CostCalculationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("El request no puede ser nulo.");
        }
        if (request.getYield() == null || request.getYield() < 1) {
            throw new IllegalArgumentException("El rendimiento debe ser al menos 1.");
        }
        if (request.getPreparationHours() == null
                || request.getPreparationHours().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El tiempo de preparación debe ser mayor a cero.");
        }
        if (request.getIndirectCostPercentage() == null
                || request.getIndirectCostPercentage().compareTo(BigDecimal.ZERO) < 0
                || request.getIndirectCostPercentage().compareTo(ONE_HUNDRED) > 0) {
            throw new IllegalArgumentException("El porcentaje de costos indirectos debe estar entre 0 y 100.");
        }
        if (request.getLaborCostPerHour() != null
                && request.getLaborCostPerHour().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El costo por hora no puede ser negativo.");
        }
        if (request.getIngredients() == null || request.getIngredients().isEmpty()) {
            throw new IllegalArgumentException("La receta debe tener al menos un ingrediente.");
        }
         // Validación de markup: se valida que NO sea negativo.
        BigDecimal markup = request.getProfitMarginPercentage();
        if (markup != null && markup.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El sobreprecio (markup) no puede ser negativo.");
        }
    }

    private void validateIngredient(IngredientCostInput ing) {
        if (ing.getPurchasePrice() == null || ing.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "El precio de compra de \"" + ing.getIngredientName() + "\" debe ser mayor a cero.");
        }
        if (ing.getPurchaseQuantity() == null || ing.getPurchaseQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad de compra de \"" + ing.getIngredientName() + "\" debe ser mayor a cero.");
        }
        if (ing.getQuantity() == null || ing.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad usada de \"" + ing.getIngredientName() + "\" debe ser mayor a cero.");
        }
        if (ing.getPurchaseUnit() == null || ing.getRecipeUnit() == null) {
            throw new IllegalArgumentException(
                    "Las unidades de \"" + ing.getIngredientName() + "\" no pueden ser nulas.");
        }
    }
}
