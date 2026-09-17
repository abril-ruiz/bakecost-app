package com.bakecost.ingredient;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

// Servicio con métodos para convertir cantidades entre dif unidades de medida y calcular costos basados en esas conversiones
@Service
public class UnitConverter {

    public BigDecimal convertQuantity(BigDecimal quantity, MeasurementUnit fromUnit, MeasurementUnit toUnit) {
        if (fromUnit == toUnit) return quantity;
        if (!areCompatible(fromUnit, toUnit)) {
            throw new UnitConversionException("No se puede convertir de " + fromUnit + " a " + toUnit + ". Unidades incompatibles.");
        }

        if (fromUnit == MeasurementUnit.KG && toUnit == MeasurementUnit.G) return quantity.multiply(new BigDecimal("1000"));
        if (fromUnit == MeasurementUnit.G && toUnit == MeasurementUnit.KG) return quantity.divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP);
        if (fromUnit == MeasurementUnit.L && toUnit == MeasurementUnit.ML) return quantity.multiply(new BigDecimal("1000"));
        if (fromUnit == MeasurementUnit.ML && toUnit == MeasurementUnit.L) return quantity.divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP);

        throw new UnitConversionException("Conversión no soportada entre " + fromUnit + " y " + toUnit);
    }

    public BigDecimal calculateCost(BigDecimal purchasePrice, BigDecimal purchaseQuantity, MeasurementUnit purchaseUnit, 
                                    BigDecimal recipeQuantity, MeasurementUnit recipeUnit) {
        // Convertir la cantidad que pide la receta a la unidad en la que se compró
        BigDecimal convertedRecipeQuantity = convertQuantity(recipeQuantity, recipeUnit, purchaseUnit);
        
        // Calcular el costo por unidad de compra (ej. precio por 1 KG)
        BigDecimal unitCost = purchasePrice.divide(purchaseQuantity, 6, RoundingMode.HALF_UP);
        
        // Multiplicar por la cantidad convertida que usa la receta
        return unitCost.multiply(convertedRecipeQuantity).setScale(2, RoundingMode.HALF_UP);
    }
// Verifica si dos unidades son compatibles para conversión (peso con peso, volumen con volumen)
    private boolean areCompatible(MeasurementUnit unit1, MeasurementUnit unit2) {
        boolean isWeight = (unit1 == MeasurementUnit.KG || unit1 == MeasurementUnit.G) && 
                           (unit2 == MeasurementUnit.KG || unit2 == MeasurementUnit.G);
        boolean isVolume = (unit1 == MeasurementUnit.L || unit1 == MeasurementUnit.ML) && 
                           (unit2 == MeasurementUnit.L || unit2 == MeasurementUnit.ML);
        return isWeight || isVolume || (unit1 == unit2);
    }
}