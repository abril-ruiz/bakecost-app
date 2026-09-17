package com.bakecost.recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Operaciones CRUD para la entidad RecipeIngredient
@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    void deleteByRecipeId(Long recipeId);
}