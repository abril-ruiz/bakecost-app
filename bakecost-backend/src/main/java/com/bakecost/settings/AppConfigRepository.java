package com.bakecost.settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// Operaciones CRUD para la entidad AppConfiguration
@Repository
public interface AppConfigRepository extends JpaRepository<AppConfiguration, Long> {
    // Método para buscar una configuración por su clave
    Optional<AppConfiguration> findByKey(String key);
}