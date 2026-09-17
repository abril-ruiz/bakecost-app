package com.bakecost.shared.config;

import com.bakecost.ingredient.UnitConversionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.Map;

// Manejador global de excepciones para toda la API REST.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Errores de validación de negocio → 400 Bad Request 
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "ValidationError",
                "message", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    //  Errores de conversión de unidades → 400 Bad Request 
    @ExceptionHandler(UnitConversionException.class)
    public ResponseEntity<Map<String, Object>> handleUnitConversion(UnitConversionException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "UnitConversionError",
                "message", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // Recurso no encontrado → 404 Not Found 
    // Usado por los servicios cuando buscan por ID en la base de datos.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "NotFoundError",
                "message", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // Errores inesperados → 500 Internal Server Error 
    // El stack trace se loguea en el servidor pero nunca se envía al cliente.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        ex.printStackTrace();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "InternalServerError",
                "message", "Ocurrió un error inesperado. Por favor intentá nuevamente.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
