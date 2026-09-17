package com.bakecost.ingredient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
// Pruebas unitarias para UnitConverter, verificando conversiones y cálculos de costos.
class UnitConverterTest {

    private UnitConverter unitConverter;

    @BeforeEach
    void setUp() {
        unitConverter = new UnitConverter();
    }

    @Test
    @DisplayName("Conversión KG a G debe multiplicar por 1000")
    void convertKgToG() {
        BigDecimal result = unitConverter.convertQuantity(new BigDecimal("1.5"), MeasurementUnit.KG, MeasurementUnit.G);
        assertThat(result).isEqualByComparingTo("1500");
    }

    @Test
    @DisplayName("Conversión G a KG debe dividir por 1000 con redondeo HALP_UP")
    void convertGToKg() {
        BigDecimal result = unitConverter.convertQuantity(new BigDecimal("250"), MeasurementUnit.G, MeasurementUnit.KG);
        assertThat(result).isEqualByComparingTo("0.2500"); // Redondeo a 4 decimales
    }

    @Test
    @DisplayName("Conversión L a ML debe multiplicar por 1000")
    void convertLToMl() {
        BigDecimal result = unitConverter.convertQuantity(new BigDecimal("0.75"), MeasurementUnit.L, MeasurementUnit.ML);
        assertThat(result).isEqualByComparingTo("750");
    }

    @Test
    @DisplayName("Conversión ML a L debe dividir por 1000")
    void convertMlToL() {
        BigDecimal result = unitConverter.convertQuantity(new BigDecimal("500"), MeasurementUnit.ML, MeasurementUnit.L);
        assertThat(result).isEqualByComparingTo("0.5000");
    }

    @Test
    @DisplayName("Unidades incompatibles (ej. KG a ML) deben lanzar UnitConversionException")
    void incompatibleUnitsThrowException() {
        assertThatThrownBy(() -> unitConverter.convertQuantity(new BigDecimal("1"), MeasurementUnit.KG, MeasurementUnit.ML))
                .isInstanceOf(UnitConversionException.class)
                .hasMessageContaining("Unidades incompatibles");
    }

    @Test
    @DisplayName("Cálculo de costo proporcional y redondeo monetario")
    void calculateCostProportionalAndRounding() {
        // Ejemplo del usuario: 1 KG azúcar = $1800, receta usa 250 G
        BigDecimal cost = unitConverter.calculateCost(
                new BigDecimal("1800"), // purchasePrice
                new BigDecimal("1"),    // purchaseQuantity (1 KG)
                MeasurementUnit.KG,     // purchaseUnit
                new BigDecimal("250"),  // recipeQuantity
                MeasurementUnit.G       // recipeUnit
        );
        assertThat(cost).isEqualByComparingTo("450.00");

        // Ejemplo con redondeo: 3 KG = $1000, receta usa 1 KG. Costo esperado: 333.33
        BigDecimal costWithRounding = unitConverter.calculateCost(
                new BigDecimal("1000"), new BigDecimal("3"), MeasurementUnit.KG,
                new BigDecimal("1"), MeasurementUnit.KG
        );
        assertThat(costWithRounding).isEqualByComparingTo("333.33");
    }
}