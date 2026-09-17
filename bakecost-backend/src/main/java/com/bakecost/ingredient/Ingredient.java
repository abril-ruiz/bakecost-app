package com.bakecost.ingredient;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

// Clase que representa un ingrediente en la aplicación
// Crea la tabla "ingredient" en la base de datos con los campos especificados
@Entity
@Table(name = "ingredient")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Ingredient {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeasurementUnit unit; // Unidad (gr, ml, kg, etc.)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice; // Precio total pagado por el paquete

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchaseQuantity; // Cantidad comprada en la unidad especificada

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
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
}
