package com.bakecost.cost;
import com.bakecost.cost.dto.CostCalculationRequest;
import com.bakecost.cost.dto.IngredientCostInput;
import com.bakecost.ingredient.MeasurementUnit;
import com.bakecost.ingredient.UnitConverter;
import com.bakecost.ingredient.UnitConversionException;
import com.bakecost.recipe.dto.RecipeCostResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
// Pruebas unitarias para CostCalculationService, verificando cálculos y validaciones.
class CostCalculationServiceTest {

    private CostCalculationService service;
    private CostCalculationRequest validRequest;

    @BeforeEach
    void setUp() {
        // Se inicializa el servicio con un UnitConverter real para las pruebas
        service = new CostCalculationService(new UnitConverter());
        
        validRequest = buildValidRequest();
    }

    @Test
    @DisplayName("Cálculo exitoso: ingredientes, mano de obra, indirectos, total y por unidad")
    void calculateCostHappyPath() {
        RecipeCostResponse response = service.calculate(validRequest);

        // Verificaciones
        assertThat(response.getRecipeName()).isEqualTo("Torta de Chocolate");
        assertThat(response.getYield()).isEqualTo(10);
        
        // Harina: 1KG=$1000, usa 500G -> $500
        // Azúcar: 1KG=$1800, usa 250G -> $450
        assertThat(response.getIngredientCost()).isEqualByComparingTo("950.00");
        
        // Mano de obra: 2 horas * $7000 = $14000
        assertThat(response.getLaborCost()).isEqualByComparingTo("14000.00");
        
        // Subtotal = 950 + 14000 = 14950. Indirectos 10% = 1495.00
        assertThat(response.getIndirectCost()).isEqualByComparingTo("1495.00");
        
        // Total = 14950 + 1495 = 16445.00
        assertThat(response.getTotalCost()).isEqualByComparingTo("16445.00");
        
        // Costo por unidad = 16445 / 10 = 1644.50
        assertThat(response.getCostPerUnit()).isEqualByComparingTo("1644.50");
        
        assertThat(response.getIngredientDetails()).hasSize(2);
    }

    @Test
    @DisplayName("Validación: Request nulo debe lanzar excepción")
    void validateNullRequest() {
        assertThatThrownBy(() -> service.calculate(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El request no puede ser nulo.");
    }

    @Test
    @DisplayName("Validación: Rendimiento cero o negativo debe lanzar excepción")
    void validateInvalidYield() {
        validRequest.setYield(0);
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El rendimiento debe ser al menos 1.");
    }

    @Test
    @DisplayName("Validación: Tiempo de preparación cero o negativo debe lanzar excepción")
    void validateInvalidPreparationHours() {
        validRequest.setPreparationHours(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El tiempo de preparación debe ser mayor a cero.");
    }

    @Test
    @DisplayName("Validación: Porcentaje de costos indirectos fuera de rango (0-100)")
    void validateInvalidIndirectCostPercentage() {
        validRequest.setIndirectCostPercentage(new BigDecimal("150"));
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El porcentaje de costos indirectos debe estar entre 0 y 100.");
    }

    @Test
    @DisplayName("Validación: Lista de ingredientes vacía o nula")
    void validateEmptyIngredients() {
        validRequest.setIngredients(null);
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La receta debe tener al menos un ingrediente.");
    }

    @Test
    @DisplayName("Validación: Precio o cantidad de ingrediente cero o negativo")
    void validateInvalidIngredientData() {
        validRequest.getIngredients().get(0).setPurchasePrice(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("debe ser mayor a cero");
    }

    @Test
    @DisplayName("Propagación de error: Unidades incompatibles en ingrediente deben lanzar UnitConversionException")
    void validateIncompatibleUnitsInIngredient() {
        // Intentar comprar en KG pero usar en ML
        validRequest.getIngredients().get(0).setPurchaseUnit(MeasurementUnit.KG);
        validRequest.getIngredients().get(0).setRecipeUnit(MeasurementUnit.ML);
        
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(UnitConversionException.class);
    }

    
    @Test
    @DisplayName("Sin markup: los campos de precio de venta deben ser null")
    void withoutMarkup_sellingFieldsAreNull() {
        RecipeCostResponse response = service.calculate(validRequest);
        assertThat(response.getProfitMarginPercentage()).isNull();
        assertThat(response.getSellingPrice()).isNull();
        assertThat(response.getEstimatedProfit()).isNull();
        assertThat(response.getSellingPricePerUnit()).isNull();
    }

    @Test
    @DisplayName("Markup 0%: precio de venta es igual al costo total")
    void withMarkupZero_sellingPriceEqualsCost() {
        validRequest.setProfitMarginPercentage(BigDecimal.ZERO);
        RecipeCostResponse response = service.calculate(validRequest);

        assertThat(response.getProfitMarginPercentage()).isEqualByComparingTo("0");
        assertThat(response.getSellingPrice()).isEqualByComparingTo("16445.00"); // Igual al totalCost
        assertThat(response.getEstimatedProfit()).isEqualByComparingTo("0.00");
        assertThat(response.getSellingPricePerUnit()).isEqualByComparingTo("1644.50");
    }

     @Test
    @DisplayName("Markup 50%: precioVenta = costo * 1.5")
    void withMarkup50_sellingPriceIsCostPlus50Percent() {
        // totalCost = 16445.00
        // sellingPrice = 16445 * 1.50 = 24667.50
        // estimatedProfit = 24667.50 - 16445 = 8222.50
        // sellingPricePerUnit = 24667.50 / 10 = 2466.75
        validRequest.setProfitMarginPercentage(new BigDecimal("50"));
        RecipeCostResponse response = service.calculate(validRequest);

        assertThat(response.getProfitMarginPercentage()).isEqualByComparingTo("50");
        assertThat(response.getSellingPrice()).isEqualByComparingTo("24667.50");
        assertThat(response.getEstimatedProfit()).isEqualByComparingTo("8222.50");
        assertThat(response.getSellingPricePerUnit()).isEqualByComparingTo("2466.75");
    }

     @Test
    @DisplayName("Markup 100%: precioVenta = costo * 2 (el doble)")
    void withMarkup100_sellingPriceIsDoubleCost() {
        // totalCost = 16445.00
        // sellingPrice = 16445 * 2.00 = 32890.00
        // estimatedProfit = 32890.00 - 16445 = 16445.00
        // sellingPricePerUnit = 32890.00 / 10 = 3289.00
        validRequest.setProfitMarginPercentage(new BigDecimal("100"));
        RecipeCostResponse response = service.calculate(validRequest);

        assertThat(response.getSellingPrice()).isEqualByComparingTo("32890.00");
        assertThat(response.getEstimatedProfit()).isEqualByComparingTo("16445.00");
        assertThat(response.getSellingPricePerUnit()).isEqualByComparingTo("3289.00");
    }

    @Test
    @DisplayName("Validación: Markup negativo debe lanzar excepción")
    void validateNegativeMarkup() {
        validRequest.setProfitMarginPercentage(new BigDecimal("-10"));
        assertThatThrownBy(() -> service.calculate(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El sobreprecio (markup) no puede ser negativo.");
    }

    @Test
    @DisplayName("Los campos de costo base no cambian cuando se agrega markup")
    void costFieldsUnchangedWhenMarkupAdded() {
        RecipeCostResponse sinMarkup = service.calculate(validRequest);

        validRequest.setProfitMarginPercentage(new BigDecimal("100"));
        RecipeCostResponse conMarkup = service.calculate(validRequest);

        assertThat(conMarkup.getIngredientCost()).isEqualByComparingTo(sinMarkup.getIngredientCost());
        assertThat(conMarkup.getLaborCost()).isEqualByComparingTo(sinMarkup.getLaborCost());
        assertThat(conMarkup.getIndirectCost()).isEqualByComparingTo(sinMarkup.getIndirectCost());
        assertThat(conMarkup.getTotalCost()).isEqualByComparingTo(sinMarkup.getTotalCost());
        assertThat(conMarkup.getCostPerUnit()).isEqualByComparingTo(sinMarkup.getCostPerUnit());
    }

    // ── Helper para construir un request válido y no repetir código ──
    private CostCalculationRequest buildValidRequest() {
        CostCalculationRequest request = new CostCalculationRequest();
        request.setRecipeName("Torta de Chocolate");
        request.setYield(10);
        request.setPreparationHours(new BigDecimal("2.0"));
        request.setIndirectCostPercentage(new BigDecimal("10"));
        request.setLaborCostPerHour(new BigDecimal("7000"));

        IngredientCostInput harina = new IngredientCostInput();
        harina.setIngredientName("Harina");
        harina.setPurchasePrice(new BigDecimal("1000"));
        harina.setPurchaseQuantity(new BigDecimal("1"));
        harina.setPurchaseUnit(MeasurementUnit.KG);
        harina.setQuantity(new BigDecimal("500"));
        harina.setRecipeUnit(MeasurementUnit.G);

        IngredientCostInput azucar = new IngredientCostInput();
        azucar.setIngredientName("Azúcar");
        azucar.setPurchasePrice(new BigDecimal("1800"));
        azucar.setPurchaseQuantity(new BigDecimal("1"));
        azucar.setPurchaseUnit(MeasurementUnit.KG);
        azucar.setQuantity(new BigDecimal("250"));
        azucar.setRecipeUnit(MeasurementUnit.G);

        request.setIngredients(List.of(harina, azucar));
        return request;
    }

}