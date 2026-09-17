package com.bakecost.ingredient;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

// Servicio que maneja la lógica de negocio relacionada con los ingredientes
@Service
@Transactional
public class IngredientService {
    private final IngredientRepository repository;

    public IngredientService(IngredientRepository repository) {
        this.repository = repository;
    }
 // Método para crear un nuevo ingrediente
    public Ingredient createIngredient(Ingredient ingredient) {
        if (repository.existsByNameIgnoreCase(ingredient.getName())) {
            throw new IllegalArgumentException("Ya existe un ingrediente con el nombre: " + ingredient.getName());
        }
        if (ingredient.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0 || 
            ingredient.getPurchaseQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio y la cantidad deben ser mayores a cero.");
        }
        return repository.save(ingredient);
    }
// Método para obtener todos los ingredientes
    public List<Ingredient> getAllIngredients() {
        return repository.findAll();
    }
// Método para actualizar un ingrediente existente
    public Ingredient updateIngredient(Long id, Ingredient updatedIngredient) {
        Ingredient existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingrediente no encontrado con ID: " + id));
        
        existing.setName(updatedIngredient.getName());
        existing.setUnit(updatedIngredient.getUnit());
        existing.setPurchasePrice(updatedIngredient.getPurchasePrice());
        existing.setPurchaseQuantity(updatedIngredient.getPurchaseQuantity());
        
        return repository.save(existing);
    }
// Método para eliminar un ingrediente por su ID
    public void deleteIngredient(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Ingrediente no encontrado");
        }
        repository.deleteById(id);
    }
}