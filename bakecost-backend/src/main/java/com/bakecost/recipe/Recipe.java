package com.bakecost.recipe;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Entidad que representa una receta de cocina
@Entity
@Table(name = "recipe")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipeCategory category;

    // Cuántas unidades produce la receta (ej: 24 medialunas, 2 panes)
    @Column(nullable = false)
    private Integer yield;

    // Tiempo de preparación en horas (ej: 2.5 horas)
    @Column(name = "preparation_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal preparationHours;

    // Porcentaje de costos indirectos (ej: 10, 15, 20)
    @Column(name = "indirect_cost_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal indirectCostPercentage;

    // Lista de ingredientes asociados a la receta
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper para mantener la relación bidireccional sincronizada
    public void addIngredient(RecipeIngredient ingredient) {
        ingredients.add(ingredient);
        ingredient.setRecipe(this);
    }

    public void removeIngredient(RecipeIngredient ingredient) {
        ingredients.remove(ingredient);
        ingredient.setRecipe(null);
    }
}