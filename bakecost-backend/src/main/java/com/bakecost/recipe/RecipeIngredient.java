package com.bakecost.recipe;

import com.bakecost.ingredient.Ingredient;
import com.bakecost.ingredient.MeasurementUnit;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

// Entidad que representa la relación entre una receta y un ingrediente
@Entity
@Table(name = "recipe_ingredient", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"recipe_id", "ingredient_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Ingredient ingredient;

    // Cantidad que usa la receta (ej: 250)
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal quantity;

    // Unidad en la que la receta pide el ingrediente (ej: GRAMOS)
    // Puede ser DIFERENTE a la unidad en la que se compró
    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_unit", nullable = false)
    private MeasurementUnit recipeUnit;
}