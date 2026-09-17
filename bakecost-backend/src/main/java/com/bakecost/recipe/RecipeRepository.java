package com.bakecost.recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Operaciones CRUD para la entidad Recipe
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
}