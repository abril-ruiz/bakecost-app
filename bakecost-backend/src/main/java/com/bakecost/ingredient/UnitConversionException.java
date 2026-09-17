package com.bakecost.ingredient;
// Clase que representa una excepción personalizada para errores de conversión de unidades
public class UnitConversionException extends RuntimeException {
    public UnitConversionException(String message) {
        super(message);
    }
}
