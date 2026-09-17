import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MenuBook as EmptyIcon,
  Inventory2 as IngredientsIcon,
  School as TutorialIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { recipeService } from "../services/recipeService";
import { ingredientService } from "../services/ingredientService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Constantes de presentación
const CATEGORY_META = {
  TORTA: { label: "🎂 Torta", color: "#7c3aed" },
  PAN: { label: "🍞 Pan", color: "#22c55e" },
  FACTURAS: { label: "🥐 Facturas", color: "#f59e0b" },
  GALLETITAS: { label: "🍪 Galletitas", color: "#6366f1" },
  BUDIN: { label: "🍮 Budín", color: "#ef4444" },
  POSTRE: { label: "🍨 Postre", color: "#a855f7" },
  OTRO: { label: "🧁 Otro", color: "#6b7280" },
};

// Página principal de recetas
export default function RecipesPage() {
  // Título dinámico
  useDocumentTitle("Recetas");

  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [ingredientCount, setIngredientCount] = useState(null); // null = cargando
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err) {
      showSnack(err.message ?? "Error al cargar recetas.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    ingredientService.getAll().then((list) => setIngredientCount(list.length));
  }, [loadRecipes]);

  // Filtrado de recetas según la búsqueda
  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (CATEGORY_META[r.category]?.label ?? r.category)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (recipe) => {
    if (
      !window.confirm(
        `¿Eliminás "${recipe.name}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await recipeService.delete(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      showSnack(`"${recipe.name}" eliminada.`, "info");
    } catch (err) {
      showSnack(err.message ?? "No se pudo eliminar.", "error");
    }
  };

  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Mis Recetas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {recipes.length === 0
              ? "Aún no tenés recetas creadas."
              : `${recipes.length} receta${recipes.length !== 1 ? "s" : ""} guardada${recipes.length !== 1 ? "s" : ""}.`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/recipes/new")}
        >
          Nueva receta
        </Button>
      </Box>

      {/* Banner: sin ingredientes registrados — bloqueante para crear recetas */}
      {ingredientCount === 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              size="small"
              color="inherit"
              startIcon={<IngredientsIcon />}
              onClick={() => navigate("/ingredients")}
              sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
            >
              Ir a ingredientes
            </Button>
          }
        >
          Antes de crear una receta necesitás registrar los ingredientes que vas
          a utilizar.
        </Alert>
      )}

      {/* Buscador */}
      {recipes.length > 0 && (
        <TextField
          placeholder="Buscar por nombre o categoría..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 3, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {/* Estado vacío */}
      {recipes.length === 0 && (
        <Card
          sx={{
            background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: "1px solid #ddd6fe",
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <EmptyIcon sx={{ fontSize: 64, color: "#c4b5fd", mb: 1.5 }} />
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              Todavía no tenés recetas
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 380, mx: "auto" }}
            >
              Creá tu primera receta, elegí los ingredientes, definí el
              rendimiento y calculá el costo real de cada unidad producida.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/recipes/new")}
              >
                Crear primera receta
              </Button>
              <Button
                variant="outlined"
                startIcon={<TutorialIcon />}
                onClick={() => navigate("/tutorial")}
              >
                Ver tutorial
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sin resultados de búsqueda */}
      {recipes.length > 0 && filtered.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No se encontraron recetas que coincidan con "{searchQuery}".
        </Alert>
      )}

      {/* Grid de recetas */}
      {filtered.length > 0 && (
        <Grid container spacing={2.5}>
          {filtered.map((recipe) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                onCalculate={() => navigate(`/recipes/${recipe.id}/cost`)}
                onDelete={() => handleDelete(recipe)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Componente para mostrar la tarjeta de una receta
function RecipeCard({ recipe, onCalculate, onDelete }) {
  const meta = CATEGORY_META[recipe.category] ?? {
    label: recipe.category,
    color: "#6b7280",
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Banda de color superior */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
        }}
      />

      <CardContent sx={{ flexGrow: 1, pt: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ lineHeight: 1.3, mr: 1 }}
          >
            {recipe.name}
          </Typography>
          <Chip
            label={meta.label}
            size="small"
            sx={{
              backgroundColor: `${meta.color}15`,
              color: meta.color,
              fontWeight: 700,
              fontSize: "0.7rem",
              flexShrink: 0,
            }}
          />
        </Box>

        {recipe.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
            noWrap
          >
            {recipe.description}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <InfoRow
            label="Rendimiento"
            value={`${recipe.yield} unidad${recipe.yield !== 1 ? "es" : ""}`}
          />
          <InfoRow label="Preparación" value={`${recipe.preparationHours} h`} />
          <InfoRow
            label="Costos indirectos"
            value={`${recipe.indirectCostPercentage}%`}
          />
          <InfoRow
            label="Ingredientes"
            value={`${recipe.ingredients?.length ?? 0} ítem${(recipe.ingredients?.length ?? 0) !== 1 ? "s" : ""}`}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CalculateIcon />}
          onClick={onCalculate}
          sx={{ flex: 1 }}
        >
          Calcular costo
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
