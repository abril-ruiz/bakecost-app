package com.bakecost.ingredient;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// Controlador que maneja las solicitudes HTTP relacionadas con los ingredientes
@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {
    private final IngredientService service;

    public IngredientController(IngredientService service) {
        this.service = service;
    }
 // Endpoint para crear un nuevo ingrediente
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Ingredient ingredient) {
        try {
            return ResponseEntity.ok(service.createIngredient(ingredient));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

 // Endpoint para obtener todos los ingredientes
    @GetMapping
    public ResponseEntity<List<Ingredient>> getAll() {
        return ResponseEntity.ok(service.getAllIngredients());
    }
// Endpoint para actualizar un ingrediente existente
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Ingredient ingredient) {
        try {
            return ResponseEntity.ok(service.updateIngredient(id, ingredient));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
// Endpoint para eliminar un ingrediente por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
}