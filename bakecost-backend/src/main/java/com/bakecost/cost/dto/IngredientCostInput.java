package com.bakecost.cost.dto;

import com.bakecost.ingredient.MeasurementUnit;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Datos de un ingrediente necesarios para calcular su costo dentro de una receta.
 * El frontend envía un snapshot de los datos de compra del ingrediente junto con
 * la cantidad y unidad que usa la receta.
 *
 * DISEÑO V1 (stateless):
 *   El backend NO busca el ingrediente en la base de datos.
 *   Todos los datos necesarios para el cálculo vienen en el request.
 *   Esto permite que el frontend opere con localStorage sin requerir
 *   que los ingredientes existan en PostgreSQL.
 */
@Data
public class IngredientCostInput {

    // Nombre del ingrediente 
    private String ingredientName;

    // Precio total pagado por el paquete de compra 
    private BigDecimal purchasePrice;

    // Cantidad que trae el paquete 
    private BigDecimal purchaseQuantity;

    // Unidad en que se compró el ingrediente 
    private MeasurementUnit purchaseUnit;

    // Cantidad que usa la receta
    private BigDecimal quantity;

    // Unidad en que la receta pide el ingrediente
    private MeasurementUnit recipeUnit;
}
