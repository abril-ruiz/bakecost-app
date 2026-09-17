package com.bakecost.recipe;
import com.bakecost.settings.AppConfigService;
import com.bakecost.ingredient.Ingredient;
import com.bakecost.ingredient.IngredientRepository;
import com.bakecost.ingredient.UnitConverter;
import com.bakecost.recipe.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
// Maneja la lógica de negocio relacionada con las recetas (creación, cálculo de costos y eliminación)
@Service
@Transactional
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitConverter unitConverter;
    private final AppConfigService configService;

    public RecipeService(RecipeRepository recipeRepository,
                         IngredientRepository ingredientRepository,
                         UnitConverter unitConverter,
                         AppConfigService configService) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.unitConverter = unitConverter;
        this.configService = configService;
    }
 
    // Crea una nueva receta a partir de la solicitud proporcionada
    public Recipe createRecipe(RecipeRequest request) {
        validateRecipeRequest(request);
        
        Recipe recipe = Recipe.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .yield(request.getYield())
                .preparationHours(request.getPreparationHours())
                .indirectCostPercentage(request.getIndirectCostPercentage())
                .build();

        for (var ingReq : request.getIngredients()) {
            Ingredient ingredient = ingredientRepository.findById(ingReq.getIngredientId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Ingrediente no encontrado con ID: " + ingReq.getIngredientId()));
            
            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                    .ingredient(ingredient)
                    .quantity(ingReq.getQuantity())
                    .recipeUnit(ingReq.getRecipeUnit())
                    .build();
            recipe.addIngredient(recipeIngredient);
        }

        return recipeRepository.save(recipe);
    }
    // Obtiene todas las recetas almacenadas en la base de datos
    @Transactional(readOnly = true)
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    // Obtiene una receta por ID
    @Transactional(readOnly = true)
    public Recipe getRecipeById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public RecipeCostResponse calculateRecipeCost(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + recipeId));

        BigDecimal ingredientCost = BigDecimal.ZERO;
        List<RecipeCostResponse.IngredientCostDetail> details = new ArrayList<>();

        // 1. Calcular costo de cada ingrediente
        for (RecipeIngredient ri : recipe.getIngredients()) {
            BigDecimal cost = unitConverter.calculateCost(
                    ri.getIngredient().getPurchasePrice(),
                    ri.getIngredient().getPurchaseQuantity(),
                    ri.getIngredient().getUnit(),
                    ri.getQuantity(),
                    ri.getRecipeUnit()
            );
            ingredientCost = ingredientCost.add(cost);
            details.add(RecipeCostResponse.IngredientCostDetail.builder()
                    .ingredientName(ri.getIngredient().getName())
                    .quantityUsed(ri.getQuantity())
                    .unitUsed(ri.getRecipeUnit().name())
                    .cost(cost)
                    .build());
        }

        // 2. Calcular costo de mano de obra
        BigDecimal laborCostPerHour = configService.getLaborCostPerHour();
        BigDecimal laborCost = recipe.getPreparationHours()
                .multiply(laborCostPerHour)
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Calcular costos indirectos (% sobre ingredientes + mano de obra)
        BigDecimal subtotal = ingredientCost.add(laborCost);
        BigDecimal indirectCost = subtotal
                .multiply(recipe.getIndirectCostPercentage())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // 4. Costo total y costo por unidad
        BigDecimal totalCost = subtotal.add(indirectCost);
        BigDecimal costPerUnit = totalCost.divide(
                new BigDecimal(recipe.getYield()), 2, RoundingMode.HALF_UP);

        return RecipeCostResponse.builder()
                .recipeId(recipe.getId())
                .recipeName(recipe.getName())
                .yield(recipe.getYield())
                .ingredientCost(ingredientCost)
                .laborCost(laborCost)
                .indirectCost(indirectCost)
                .totalCost(totalCost)
                .costPerUnit(costPerUnit)
                .ingredientDetails(details)
                .build();
    }

    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new RuntimeException("Receta no encontrada");
        }
        recipeRepository.deleteById(id);
    }

    // Valida los datos de la solicitud de receta antes de crearla
    private void validateRecipeRequest(RecipeRequest request) {
        if (request.getYield() == null || request.getYield() <= 0) {
            throw new IllegalArgumentException("El rendimiento debe ser mayor a cero.");
        }
        if (request.getPreparationHours().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El tiempo de preparación debe ser mayor a cero.");
        }
        if (request.getIndirectCostPercentage().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El porcentaje de costos indirectos no puede ser negativo.");
        }
        if (request.getIngredients() == null || request.getIngredients().isEmpty()) {
            throw new IllegalArgumentException("La receta debe tener al menos un ingrediente.");
        }
    }
}