package com.bakecost.cost.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Request completo para el cálculo stateless de costos de una receta.
 *
 * El frontend envía todos los datos necesarios para que el backend
 * realice el cálculo sin consultar la base de datos.
 */
@Data
public class CostCalculationRequest {

    private String recipeName;

// Cantidad de unidades que produce la receta. (>= 1)
    private Integer yield;

// Horas de preparación. (>0)
    private BigDecimal preparationHours;

// Porcentaje de costos indirectos (0–100).
    private BigDecimal indirectCostPercentage;

// Valor de la hora de trabajo en moneda local.
    private BigDecimal laborCostPerHour;

    // Lista de ingredientes con sus datos de compra y cantidades usadas en la receta
    private List<IngredientCostInput> ingredients;

    /**
     * Porcentaje de sobreprecio (markup) 
     * que se desea aplicar al costo total para obtener el precio de venta.
     * Puede ser null o 0 si no se desea aplicar markup.
     * Se valida que no sea negativo.
     */
    private BigDecimal profitMarginPercentage;
}
