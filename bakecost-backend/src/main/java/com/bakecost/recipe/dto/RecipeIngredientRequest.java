package com.bakecost.recipe.dto;

import com.bakecost.ingredient.MeasurementUnit;
import lombok.Data;
import java.math.BigDecimal;
// DTO para la solicitud de creación o actualización de un ingrediente de receta
@Data
public class RecipeIngredientRequest {
    private Long ingredientId;
    private BigDecimal quantity;
    private MeasurementUnit recipeUnit;
}