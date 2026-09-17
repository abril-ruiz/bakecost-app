# BakeCost Backend

## Descripción

El backend de BakeCost está construido con Spring Boot y Java 21. Su responsabilidad principal en la versión actual es exponer un **endpoint stateless de cálculo de costos** que el frontend consume para obtener resultados con precisión monetaria (`BigDecimal`). No persiste datos de usuario en la base de datos durante esta versión — todos los datos del usuario viven en el navegador.

La base de datos PostgreSQL y las entidades JPA están implementadas y preparadas para una **futura versión con cuentas de usuario**, donde cada usuario tendrá sus propios ingredientes, recetas y configuración sincronizados en la nube.

## Tecnologías utilizadas

- Java 21 - Lenguaje principal
- Spring Boot 4.1.1 - Framework web y de aplicación
- Spring Data JPA - ORM y acceso a datos
- Hibernate - Implementación JPA
- PostgreSQL 15+ - Base de datos relacional
- Lombok - Reducción de boilerplate
- JUnit 5 - Framework de testing
- AssertJ - Assertions fluidas en tests

## Instalación y ejecución

### Requisitos

- Java 21
- Maven 3.9+
- PostgreSQL 15+ corriendo localmente

### Pasos

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env con las credenciales locales de PostgreSQL
#    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bakecost_dev
#    SPRING_DATASOURCE_USERNAME=tu_usuario
#    SPRING_DATASOURCE_PASSWORD=tu_password

# 3. Crear la base de datos en PostgreSQL
#    CREATE DATABASE bakecost_dev;

# 4. Cargar las variables de entorno (PowerShell)
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
  }
}

# 5. Ejecutar
./mvnw spring-boot:run      # http://localhost:8080
```

### Ejecutar tests

```bash
./mvnw test
```

---

## Estructura del proyecto

```
src/main/java/com/bakecost/
│
├── BakecostBackendApplication.java   # Punto de entrada Spring Boot
│
├── cost/                             # Endpoint stateless de cálculo (V actual)
│   ├── CostController.java           # POST /api/costs/calculate
│   ├── CostCalculationService.java   # Lógica de cálculo sin acceso a BD
│   └── dto/
│       ├── CostCalculationRequest.java   # Datos de entrada del frontend
│       └── IngredientCostInput.java      # Datos de un ingrediente por cálculo
│
├── ingredient/                       # Dominio ingredientes
│   ├── Ingredient.java               # Entidad JPA
│   ├── IngredientController.java     # CRUD REST
│   ├── IngredientRepository.java     # Spring Data JPA
│   ├── IngredientService.java        # Lógica de negocio
│   ├── MeasurementUnit.java          # Enum: KG, G, L, ML, UNIDAD
│   ├── UnitConverter.java            # Conversión de unidades y cálculo de costo
│   └── UnitConversionException.java  # Excepción para unidades incompatibles
│
├── recipe/                           # Dominio recetas
│   ├── Recipe.java                   # Entidad JPA
│   ├── RecipeIngredient.java         # Relación receta-ingrediente
│   ├── RecipeCategory.java           # Enum de categorías
│   ├── RecipeController.java         # CRUD REST
│   ├── RecipeRepository.java
│   ├── RecipeIngredientRepository.java
│   ├── RecipeService.java            # Lógica de costos con BD
│   └── dto/
│       ├── RecipeRequest.java
│       ├── RecipeIngredientRequest.java
│       └── RecipeCostResponse.java   # Respuesta de cálculo (usada por ambos flujos)
│
├── settings/                         # Configuración de la aplicación
│   ├── AppConfiguration.java         # Entidad clave-valor
│   ├── AppConfigController.java      # GET/PUT /api/config/labor-cost
│   ├── AppConfigRepository.java
│   └── AppConfigService.java
│
└── shared/config/
    ├── CorsConfig.java               # Configuración CORS por variable de entorno
    └── GlobalExceptionHandler.java   # Manejo centralizado de errores
```

---

## Funcionalidades

- **Cálculo de Costos Stateless (`POST /api/costs/calculate`)**
  - **Procesamiento en memoria:** El backend valida, convierte unidades y desglosa costos en tiempo real sin consultar la base de datos.
  - **Compatibilidad con `localStorage`:** Permite al frontend operar de forma local mientras aprovecha la precisión matemática del backend.
  - **Precisión monetaria:** Utiliza `BigDecimal` en Java para garantizar la exactitud de cada cálculo.

- **Conversión Inteligente de Unidades (`UnitConverter`)**
  - **Sistemas soportados:** Conversiones automáticas de Peso (`KG ↔ G`) y Volumen (`L ↔ ML`).
  - **Precisión de redondeo:** Aplica `RoundingMode.HALF_UP` en todas las operaciones financieras.
  - **Seguridad tipográfica:** Lanza la excepción personalizada `UnitConversionException` ante intentos de conversión incompatibles.

- **API REST Completa para Gestión**
  - **Ingredientes:** Operaciones CRUD completas (`GET`, `POST`, `PUT`, `DELETE`) en `/api/ingredients`.
  - **Recetas:** Listado, creación, eliminación y cálculo de costos basado en base de datos (`/api/recipes`).
  - **Configuración:** Consulta y actualización del valor de la hora de mano de obra (`/api/config/labor-cost`).

- **Manejo Centralizado de Errores**
  - **Controlador global:** `GlobalExceptionHandler` unifica todas las respuestas de error en un formato JSON estándar (`error`, `message`, `timestamp`).
  - **Mapeo de estados HTTP:**
    - `400 Bad Request` para `IllegalArgumentException` y `UnitConversionException`.
    - `404 Not Found` para `RuntimeException`.
    - `500 Internal Server Error` para excepciones genéricas (oculta el _stack trace_ en producción).

- **Seguridad y CORS Flexible**
  - **Configuración dinámica:** Control de accesos mediante la variable de entorno `ALLOWED_ORIGINS` (soporta múltiples orígenes separados por comas).
  - **Alcance:** Restringido exclusivamente a los endpoints bajo la ruta `/api/**`.

## Testing

Los tests son unitarios puros — no requieren base de datos ni Spring context.

```bash
./mvnw test
```

#### Cobertura de Pruebas

- **Pruebas de Conversión (`UnitConverterTest`)**
  - **Flujos correctos:** Verifica las conversiones bidireccionales de peso (`KG ↔ G`) y volumen (`L ↔ ML`).
  - **Casos base:** Valida el comportamiento correcto cuando la unidad de compra y la de la receta son la misma (sin conversión).
  - **Control de excepciones:** Asegura el lanzamiento correcto de excepciones ante unidades incompatibles.
  - **Precisión financiera:** Valida que el cálculo del costo proporcional aplique estrictamente el redondeo `HALF_UP`.

- **Pruebas de Servicio (`CostCalculationServiceTest`)**
  - **Cálculo integral:** Verifica el desglose correcto del endpoint _stateless_ (ingredientes, mano de obra, costos indirectos, totales y costo por unidad).
  - **Validación de entradas:** Evalúa las restricciones críticas del sistema (rendimiento, horas de preparación, porcentajes y listas de ingredientes vacías).
  - **Propagación de errores:** Garantiza que las excepciones como `UnitConversionException` se propaguen correctamente hacia las capas superiores desde ingredientes con unidades incompatibles.

## Notas de arquitectura

### Versión actual — Stateless

El cálculo de costos (`POST /api/costs/calculate`) no usa la base de datos. Los datos viajan completamente en el request. Esto permite que el frontend opere con datos locales mientras el backend aporta precisión `BigDecimal`.

### Preparado para la siguiente versión

La infraestructura de persistencia ya está implementada: entidades JPA (`Ingredient`, `Recipe`, `RecipeIngredient`, `AppConfiguration`), repositorios Spring Data y el servicio `RecipeService.calculateRecipeCost()` que opera con datos de la base de datos. Cuando se implemente el sistema de cuentas, el frontend podrá migrar sus datos locales a la base de datos sin cambios en la lógica de cálculo.
