package com.bakecost.recipe.dto;

import com.bakecost.recipe.RecipeCategory;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
// DTO para la solicitud de creación o actualización de una receta
@Data
public class RecipeRequest {
    private String name;
    private String description;
    private RecipeCategory category;
    private Integer yield;
    private BigDecimal preparationHours;
    private BigDecimal indirectCostPercentage;
    private List<RecipeIngredientRequest> ingredients;
}