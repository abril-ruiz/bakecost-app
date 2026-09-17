package com.bakecost.recipe;
import com.bakecost.recipe.dto.RecipeCostResponse;
import com.bakecost.recipe.dto.RecipeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// Controlador REST para manejar las solicitudes relacionadas con las recetas
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }
// Maneja la creación de una nueva receta a partir de la solicitud proporcionada
    @PostMapping
    public ResponseEntity<?> create(@RequestBody RecipeRequest request) {
        try {
            Recipe saved = service.createRecipe(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
// Maneja la obtención de todas las recetas almacenadas en la base de datos
    @GetMapping
    public ResponseEntity<List<Recipe>> getAll() {
        return ResponseEntity.ok(service.getAllRecipes());
    }
// Maneja la obtención de una receta específica por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
    try {
        Recipe recipe = service.getRecipeById(id);
        return ResponseEntity.ok(recipe);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
// Maneja la obtención del costo de una receta específica por su ID
    @GetMapping("/{id}/cost")
    public ResponseEntity<?> calculateCost(@PathVariable Long id) {
        try {
            RecipeCostResponse cost = service.calculateRecipeCost(id);
            return ResponseEntity.ok(cost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

// Maneja la eliminación de una receta específica por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteRecipe(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}