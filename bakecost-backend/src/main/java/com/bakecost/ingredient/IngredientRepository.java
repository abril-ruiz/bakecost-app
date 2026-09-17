package com.bakecost.ingredient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repositorio que permite realizar operaciones CRUD y consultas personalizadas
@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    boolean existsByNameIgnoreCase(String name);
}