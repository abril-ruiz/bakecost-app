package com.bakecost.cost;

import com.bakecost.cost.dto.CostCalculationRequest;
import com.bakecost.recipe.dto.RecipeCostResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Endpoint stateless de cálculo de costos — BakeCost V1.
@RestController
@RequestMapping("/api/costs")
public class CostController {

    private final CostCalculationService costService;

    public CostController(CostCalculationService costService) {
        this.costService = costService;
    }

    // Calcula el costo de una receta a partir de los datos enviados por el frontend.
   @PostMapping("/calculate")
    public ResponseEntity<RecipeCostResponse> calculate(
            @RequestBody CostCalculationRequest request) {
        RecipeCostResponse result = costService.calculate(request);
        return ResponseEntity.ok(result);
    }
}
