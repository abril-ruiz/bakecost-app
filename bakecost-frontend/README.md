# BakeCost Frontend

## Descripción

Aplicación React que permite gestionar ingredientes, crear recetas y calcular costos de producción. En la V1, todos los datos se almacenan en el navegador del usuario mediante `localStorage`, sin necesidad de crear una cuenta.

## Tecnologías utilizadas

- React 19 - Librería UI
- Vite 8 - Build tool y servidor de desarrollo
- Material UI (MUI) 9 - Componentes visuales y sistema de diseño
- React Router 7 - Navegación entre páginas
- react-hook-form 7 - Gestión y validación de formularios
- axios - Cliente HTTP para llamadas al backend
- Vitest 4 - Framework de testing
- jsdom 29 - Entorno DOM para tests de localStorage

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Desarrollo (http://localhost:5173)
npm run dev

# Tests
npm test               # ejecuta una vez
npm run test:watch     # modo watch (desarrollo)
npm run test:coverage  # con reporte de cobertura
```

---

## Estructura del proyecto

```
src/
├── App.jsx                    # BrowserRouter + Layout + AppRoutes
├── main.jsx                   # Punto de entrada, ThemeProvider, CssBaseline
├── theme.js                   # Tema MUI — paleta violeta/lila
│
├── components/
│   ├── layout/
│   │   ├── Layout.jsx         # Shell: sidebar + área de contenido
│   │   └── Navbar.jsx         # Drawer lateral con navegación
│   └── forms/
│       ├── IngredientForm.jsx # Formulario crear/editar ingrediente
│       └── RecipeForm.jsx     # Formulario crear receta
│
├── hooks/
│   └── useDocumentTitle.js    # Actualiza document.title por ruta
│
├── pages/
│   ├── DashboardPage.jsx      # Panel principal con stats y accesos rápidos
│   ├── IngredientsPage.jsx    # Lista, crear, editar y eliminar ingredientes
│   ├── RecipesPage.jsx        # Lista de recetas con búsqueda
│   ├── RecipeFormPage.jsx     # Wrapper de RecipeForm
│   ├── RecipeCostPage.jsx     # Desglose de costos de una receta
│   ├── TutorialPage.jsx       # Guía de uso paso a paso
│   ├── SettingsPage.jsx       # Configuración (valor hora de trabajo)
│   └── NotFoundPage.jsx       # Página 404
│
├── routes/
│   └── AppRoutes.jsx          # Definición de rutas con React Router
│
└── services/
    ├── api.js                 # Instancia axios configurada (usada en V2)
    ├── costCalculator.js      # Lógica de cálculo local (espejo del backend)
    ├── ingredientService.js   # Fachada para operaciones de ingredientes
    ├── recipeService.js       # Fachada para operaciones de recetas
    ├── configService.js       # Fachada para configuración
    └── storage/
        ├── storageEngine.js   # Acceso raw a localStorage (con error handling)
        ├── ingredientStorage.js  # CRUD de ingredientes en localStorage
        ├── recipeStorage.js      # CRUD de recetas en localStorage
        ├── settingsStorage.js    # Configuración en localStorage
        └── index.js              # Re-exportaciones
```

---

## Funcionalidades

- Registrar ingredientes con precio y cantidad de compra
- Crear recetas usando ingredientes existentes, con rendimiento y tiempo de preparación
- Calcular costo de producción: ingredientes + mano de obra + costos indirectos
- Conversión automática de unidades (KG↔G, L↔ML)
- Configurar el valor de la hora de trabajo
- Tutorial integrado con guía paso a paso
- Página 404 amigable
- Diseño responsive (desktop, tablet, mobile)
- Tema visual violeta/lila con glassmorphism moderado

## Comunicación con el backend

En **V1**, el frontend opera principalmente con `localStorage`. La única llamada al backend que puede usarse es:

```
POST /api/costs/calculate
```

Que recibe todos los datos de la receta y devuelve el desglose de costos calculado con `BigDecimal` (mayor precisión que `Number` de JavaScript).

En **V2**, los servicios (`ingredientService`, `recipeService`, `configService`) serán reescritos para llamar a la API REST. Los componentes visuales no necesitarán cambios gracias a la capa de abstracción.
