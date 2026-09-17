package com.bakecost.settings;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

// Configuración global del usuario
@Entity
@Table(name = "app_configuration")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Clave de configuración 
    @Column(name = "config_key", nullable = false, unique = true)
    private String key;

    // Valor de configuración 
    @Column(name = "config_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;
}