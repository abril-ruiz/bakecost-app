import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Alert,
  Grid,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { ingredientService } from "../../services/ingredientService";

const MEASUREMENT_UNITS = [
  { value: "KG", label: "Kilogramos (kg)" },
  { value: "G", label: "Gramos (g)" },
  { value: "L", label: "Litros (L)" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "UNIDAD", label: "Unidad" },
];

// Formulario de creación y edición de ingredientes.
export default function IngredientForm({
  ingredient = null,
  onSuccess,
  onCancel,
}) {
  const isEditing = Boolean(ingredient);
  const [apiError, setApiError] = React.useState(null);

  // Configuración de react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      unit: "KG",
      purchaseQuantity: "",
      purchasePrice: "",
    },
  });

  // Cuando se abre el formulario en modo edición, rellenar con los datos existentes
  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        unit: ingredient.unit,
        purchaseQuantity: String(ingredient.purchaseQuantity),
        purchasePrice: String(ingredient.purchasePrice),
      });
    } else {
      reset({ name: "", unit: "KG", purchaseQuantity: "", purchasePrice: "" });
    }
    setApiError(null);
  }, [ingredient, reset]);

  // Función que se ejecuta al enviar el formulario
  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const payload = {
        name: data.name.trim(),
        unit: data.unit,
        purchaseQuantity: parseFloat(data.purchaseQuantity),
        purchasePrice: parseFloat(data.purchasePrice),
      };

      let result;
      if (isEditing) {
        result = await ingredientService.update(ingredient.id, payload);
      } else {
        result = await ingredientService.create(payload);
        reset({
          name: "",
          unit: "KG",
          purchaseQuantity: "",
          purchasePrice: "",
        });
      }

      onSuccess?.(result);
    } catch (err) {
      setApiError(err.message ?? "Ocurrió un error inesperado.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        color="primary"
        sx={{ mb: 2 }}
      >
        {isEditing ? `Editando: ${ingredient.name}` : "Nuevo ingrediente"}
      </Typography>

      {apiError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Nombre */}
        <Grid size={{ xs: 12 }} sm={isEditing ? 12 : 6}>
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
                label="Nombre del ingrediente"
                placeholder="Ej: Harina 000"
                fullWidth
                size="small"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        {/* Unidad */}
        <Grid size={{ xs: 12 }} sm={isEditing ? 12 : 6}>
          <Controller
            name="unit"
            control={control}
            rules={{ required: "La unidad es obligatoria" }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Unidad de compra"
                fullWidth
                size="small"
                error={!!errors.unit}
                helperText={errors.unit?.message}
              >
                {MEASUREMENT_UNITS.map((u) => (
                  <MenuItem key={u.value} value={u.value}>
                    {u.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Cantidad comprada */}
        <Grid size={{ xs: 6 }}>
          <Controller
            name="purchaseQuantity"
            control={control}
            rules={{
              required: "La cantidad es obligatoria",
              validate: (v) => parseFloat(v) > 0 || "Debe ser mayor a 0",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cantidad comprada"
                placeholder="Ej: 1"
                type="number"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ step: "0.001", min: "0" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!errors.purchaseQuantity}
                helperText={
                  errors.purchaseQuantity?.message ?? "Cuánto trae el paquete"
                }
              />
            )}
          />
        </Grid>

        {/* Precio */}
        <Grid size={{ xs: 6 }}>
          <Controller
            name="purchasePrice"
            control={control}
            rules={{
              required: "El precio es obligatorio",
              validate: (v) => parseFloat(v) > 0 || "Debe ser mayor a 0",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Precio total ($)"
                placeholder="Ej: 500"
                type="number"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ step: "0.01", min: "0" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!errors.purchasePrice}
                helperText={
                  errors.purchasePrice?.message ??
                  "Lo que pagaste en total (sin . ni ,)"
                }
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        {/* Botones de acción */}
        {isEditing && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting}
            size="small"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
          size="small"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Agregar ingrediente"}
        </Button>
      </Box>
    </Box>
  );
}
