package com.bakecost.settings;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
// Servicio para manejar la configuración de la aplicación
@Service
@Transactional
public class AppConfigService {
    private static final String LABOR_COST_PER_HOUR_KEY = "LABOR_COST_PER_HOUR";
    private final AppConfigRepository repository;

    public AppConfigService(AppConfigRepository repository) {
        this.repository = repository;
    }
    // Método para obtener el costo de mano de obra por hora desde la configuración
    public BigDecimal getLaborCostPerHour() {
        return repository.findByKey(LABOR_COST_PER_HOUR_KEY)
                .map(AppConfiguration::getValue)
                .orElse(BigDecimal.ZERO);
    }
    // Método para establecer el costo de mano de obra por hora en la configuración
    public void setLaborCostPerHour(BigDecimal value) {
        AppConfiguration config = repository.findByKey(LABOR_COST_PER_HOUR_KEY)
                .orElse(AppConfiguration.builder().key(LABOR_COST_PER_HOUR_KEY).value(value).build());
        config.setValue(value);
        repository.save(config);
    }
}