package com.bakecost.settings;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;
// Maneja las solicitudes relacionadas con la configuración de la aplicación
@RestController
@RequestMapping("/api/config")
public class AppConfigController {
    private final AppConfigService service;

    public AppConfigController(AppConfigService service) {
        this.service = service;
    }
// Maneja la obtención del costo de mano de obra por hora
    @GetMapping("/labor-cost")
    public ResponseEntity<Map<String, BigDecimal>> getLaborCost() {
        return ResponseEntity.ok(Map.of("laborCostPerHour", service.getLaborCostPerHour()));
    }
// Maneja la actualización del costo de mano de obra por hora
    @PutMapping("/labor-cost")
    public ResponseEntity<?> setLaborCost(@RequestBody Map<String, BigDecimal> body) {
        BigDecimal value = body.get("laborCostPerHour");
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("El valor debe ser mayor o igual a cero.");
        }
        service.setLaborCostPerHour(value);
        return ResponseEntity.ok(Map.of("laborCostPerHour", value));
    }
}