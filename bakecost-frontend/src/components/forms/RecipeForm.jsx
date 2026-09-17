import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper,
  IconButton,
  Alert,
  Divider,
  Grid,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { recipeService } from "../../services/recipeService";
import { ingredientService } from "../../services/ingredientService";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { value: "TORTA", label: "🎂 Torta" },
  { value: "PAN", label: "🍞 Pan" },
  { value: "FACTURAS", label: "🥐 Facturas" },
  { value: "GALLETITAS", label: "🍪 Galletitas" },
  { value: "BUDIN", label: "🍮 Budín" },
  { value: "POSTRE", label: "🍨 Postre" },
  { value: "OTRO", label: "🧁 Otro" },
];

const UNITS = [
  { value: "KG", label: "Kilogramos (kg)" },
  { value: "G", label: "Gramos (g)" },
  { value: "L", label: "Litros (L)" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "UNIDAD", label: "Unidad" },
];

const UNIT_LABELS = { KG: "kg", G: "g", L: "L", ML: "ml", UNIDAD: "u." };

export default function RecipeForm() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "TORTA",
      yield: 1,
      preparationHours: 1,
      indirectCostPercentage: 10,
      ingredients: [{ ingredientId: "", quantity: "", recipeUnit: "G" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  // Cargar ingredientes desde localStorage
  useEffect(() => {
    ingredientService
      .getAll()
      .then(setIngredients)
      .catch(() => setApiError("No se pudieron cargar los ingredientes."))
      .finally(() => setLoadingIngredients(false));
  }, []);

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const payload = {
        ...data,
        yield: parseInt(data.yield, 10),
        preparationHours: parseFloat(data.preparationHours),
        indirectCostPercentage: parseFloat(data.indirectCostPercentage),
        // Los IDs aquí son UUIDs locales — recipeService se encarga del snapshot
        ingredients: data.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId, // UUID string
          quantity: parseFloat(ing.quantity),
          recipeUnit: ing.recipeUnit,
        })),
      };

      await recipeService.create(payload);
      navigate("/recipes");
    } catch (err) {
      setApiError(err.message ?? "Error al guardar la receta.");
    }
  };

  if (loadingIngredients) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="text.secondary">Cargando ingredientes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/recipes")}
          variant="text"
          sx={{ color: "text.secondary" }}
        >
          Volver
        </Button>
        <Divider orientation="vertical" flexItem />
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary">
            Nueva receta
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Los costos se calculan con los precios actuales de tus ingredientes.
          </Typography>
        </Box>
      </Box>

      {apiError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      )}

      {/* Lista de ingredientes */}
      {ingredients.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No tenés ingredientes registrados aún.{" "}
          <strong
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/ingredients")}
          >
            Agregá ingredientes primero.
          </strong>
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ── Sección 1: Información general ── */}
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="primary"
            sx={{ mb: 2 }}
          >
            Información general
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "El nombre es obligatorio",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre de la receta"
                    placeholder="Ej: Medialunas de manteca"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="category"
                control={control}
                rules={{ required: "La categoría es obligatoria" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Categoría"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción (opcional)"
                    placeholder="Notas sobre la receta..."
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="yield"
                control={control}
                rules={{
                  required: "El rendimiento es obligatorio",
                  min: { value: 1, message: "Al menos 1 unidad" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unidades que produce"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ min: 1, step: 1 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.yield}
                    helperText={errors.yield?.message ?? "Ej: 24 medialunas"}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="preparationHours"
                control={control}
                rules={{
                  required: "El tiempo es obligatorio",
                  min: { value: 0.1, message: "Debe ser mayor a 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tiempo de preparación (h)"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ step: 0.25, min: 0.1 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.preparationHours}
                    helperText={
                      errors.preparationHours?.message ?? "Ej: 2.5 horas"
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="indirectCostPercentage"
                control={control}
                rules={{
                  required: "El porcentaje es obligatorio",
                  min: { value: 0, message: "No puede ser negativo" },
                  max: { value: 100, message: "Máximo 100%" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Costos indirectos (%)"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ step: 1, min: 0, max: 100 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.indirectCostPercentage}
                    helperText={
                      errors.indirectCostPercentage?.message ??
                      "Gas, luz, packaging..."
                    }
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* ── Sección 2: Ingredientes ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Ingredientes
            </Typography>
            <Chip
              label={`${fields.length} ingrediente${fields.length !== 1 ? "s" : ""}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#faf5ff",
                  border: "1px solid #ede9fe",
                }}
              >
                {/* Número del ingrediente */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    mt: 1.8,
                  }}
                >
                  {index + 1}
                </Box>

                {/* Selector de ingrediente */}
                <Controller
                  name={`ingredients.${index}.ingredientId`}
                  control={control}
                  rules={{ required: "Seleccioná un ingrediente" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Ingrediente"
                      sx={{ minWidth: { xs: "100%", sm: 220 }, flex: 1 }}
                      size="small"
                      error={!!errors.ingredients?.[index]?.ingredientId}
                      helperText={
                        errors.ingredients?.[index]?.ingredientId?.message
                      }
                    >
                      {ingredients.length === 0 ? (
                        <MenuItem disabled value="">
                          Sin ingredientes
                        </MenuItem>
                      ) : (
                        ingredients.map((ing) => (
                          <MenuItem key={ing.id} value={ing.id}>
                            {ing.name}
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 1, color: "text.secondary" }}
                            >
                              (comprado en {UNIT_LABELS[ing.unit] ?? ing.unit})
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  )}
                />

                {/* Cantidad */}
                <Controller
                  name={`ingredients.${index}.quantity`}
                  control={control}
                  rules={{
                    required: "Cantidad requerida",
                    min: { value: 0.001, message: "> 0" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cantidad"
                      type="number"
                      sx={{ width: { xs: "45%", sm: 120 } }}
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon
                                sx={{ step: "0.001", min: "0.001" }}
                              />
                            </InputAdornment>
                          ),
                        },
                      }}
                      error={!!errors.ingredients?.[index]?.quantity}
                      helperText={
                        errors.ingredients?.[index]?.quantity?.message
                      }
                    />
                  )}
                />

                {/* Unidad de receta */}
                <Controller
                  name={`ingredients.${index}.recipeUnit`}
                  control={control}
                  rules={{ required: "Unidad requerida" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Unidad"
                      sx={{ width: { xs: "calc(55% - 12px)", sm: 160 } }}
                      size="small"
                      error={!!errors.ingredients?.[index]?.recipeUnit}
                    >
                      {UNITS.map((u) => (
                        <MenuItem key={u.value} value={u.value}>
                          {u.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Eliminar fila */}
                <IconButton
                  color="error"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  sx={{ mt: 0.5 }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              append({ ingredientId: "", quantity: "", recipeUnit: "G" })
            }
            disabled={ingredients.length === 0}
            sx={{ mt: 1.5, mb: 2 }}
            size="small"
            variant="outlined"
          >
            Agregar ingrediente
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* ── Acciones ── */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => navigate("/recipes")}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || ingredients.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Guardar receta"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
