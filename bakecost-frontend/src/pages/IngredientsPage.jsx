import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Snackbar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory2 as EmptyIcon,
} from "@mui/icons-material";
import IngredientForm from "../components/forms/IngredientForm";
import { ingredientService } from "../services/ingredientService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Helpers

const UNIT_LABELS = {
  KG: "kg",
  G: "g",
  L: "L",
  ML: "ml",
  UNIDAD: "u.",
};

const UNIT_COLORS = {
  KG: "#7c3aed",
  G: "#a855f7",
  L: "#6366f1",
  ML: "#8b5cf6",
  UNIDAD: "#6b7280",
};

const formatCurrency = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(v);

// Precio por unidad mínima para mostrar al usuario
function unitPrice(ingredient) {
  const price = ingredient.purchasePrice / ingredient.purchaseQuantity;
  return `${formatCurrency(price)} / ${UNIT_LABELS[ingredient.unit] ?? ingredient.unit}`;
}

// Página de gestión de ingredientes: listado, creación, edición y eliminación
export default function IngredientsPage() {
  // Título dinámico
  useDocumentTitle("Ingredientes");

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [ingredients, setIngredients] = useState([]);
  const [editingId, setEditingId] = useState(null); // ID del ingrediente en edición
  const [showForm, setShowForm] = useState(false); // mostrar formulario de creación
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Carga inicial
  const loadIngredients = useCallback(async () => {
    const data = await ingredientService.getAll();
    setIngredients(data);
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  // ── Filtro por búsqueda
  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Handlers de creación, edición y eliminación
  const handleCreateSuccess = (newIngredient) => {
    loadIngredients();
    showSnack(`"${newIngredient.name}" agregado correctamente.`, "success");
    // No ocultar el formulario para que el usuario pueda seguir agregando
  };

  const handleUpdateSuccess = (updated) => {
    loadIngredients();
    setEditingId(null);
    showSnack(`"${updated.name}" actualizado correctamente.`, "success");
  };

  const handleDelete = async (ingredient) => {
    if (
      !window.confirm(
        `¿Eliminás "${ingredient.name}"?\n\nLas recetas que lo usan conservarán sus costos calculados.`,
      )
    )
      return;
    try {
      await ingredientService.delete(ingredient.id);
      loadIngredients();
      showSnack(`"${ingredient.name}" eliminado.`, "info");
    } catch (err) {
      showSnack(err.message ?? "No se pudo eliminar.", "error");
    }
  };

  const showSnack = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  // ── Ingrediente en edición (si hay)
  const editingIngredient = editingId
    ? (ingredients.find((i) => i.id === editingId) ?? null)
    : null;

  // ── Render
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
            Ingredientes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {ingredients.length === 0
              ? "Aún no tenés ingredientes registrados."
              : `${ingredients.length} ingrediente${ingredients.length !== 1 ? "s" : ""} registrado${ingredients.length !== 1 ? "s" : ""}.`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={showForm && !editingId ? null : <AddIcon />}
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
          }}
        >
          {showForm && !editingId ? "Ocultar formulario" : "Nuevo ingrediente"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Columna izquierda: formulario ── */}
        {(showForm || editingIngredient) && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <IngredientForm
                ingredient={editingIngredient}
                onSuccess={
                  editingIngredient ? handleUpdateSuccess : handleCreateSuccess
                }
                onCancel={() => {
                  setEditingId(null);
                }}
              />
            </Paper>
          </Grid>
        )}

        {/* ── Columna derecha (o completa): lista ── */}
        <Grid size={{ xs: 12, md: showForm || editingIngredient ? 8 : 12 }}>
          {/* Buscador */}
          {ingredients.length > 0 && (
            <TextField
              placeholder="Buscar ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
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
          {ingredients.length === 0 && (
            <Card
              sx={{
                background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                border: "1px solid #ddd6fe",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 5 }}>
                <EmptyIcon sx={{ fontSize: 56, color: "#c4b5fd", mb: 1.5 }} />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="primary"
                  gutterBottom
                >
                  Sin ingredientes aún
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2.5 }}
                >
                  Registrá los ingredientes que usás con su precio y cantidad de
                  compra para poder calcular los costos de tus recetas.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowForm(true)}
                >
                  Agregar primer ingrediente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sin resultados de búsqueda */}
          {ingredients.length > 0 && filtered.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No se encontraron ingredientes que coincidan con "{searchQuery}".
            </Alert>
          )}

          {/* Tabla en desktop, cards en mobile */}
          {filtered.length > 0 &&
            (isSmall ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {filtered.map((ing) => (
                  <IngredientCard
                    key={ing.id}
                    ingredient={ing}
                    isEditing={editingId === ing.id}
                    onEdit={() => {
                      setEditingId(ing.id);
                      setShowForm(false);
                    }}
                    onDelete={() => handleDelete(ing)}
                  />
                ))}
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingrediente</TableCell>
                      <TableCell align="center">Unidad</TableCell>
                      <TableCell align="right">Cant. comprada</TableCell>
                      <TableCell align="right">Precio paquete</TableCell>
                      <TableCell align="right">Precio por unidad</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((ing) => (
                      <TableRow
                        key={ing.id}
                        sx={{
                          backgroundColor:
                            editingId === ing.id ? "#f5f3ff" : "transparent",
                          "&:hover": { backgroundColor: "#faf5ff" },
                          transition: "background-color 0.15s",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {ing.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={UNIT_LABELS[ing.unit] ?? ing.unit}
                            size="small"
                            sx={{
                              backgroundColor: `${UNIT_COLORS[ing.unit] ?? "#6b7280"}15`,
                              color: UNIT_COLORS[ing.unit] ?? "#6b7280",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {ing.purchaseQuantity}{" "}
                            {UNIT_LABELS[ing.unit] ?? ing.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(ing.purchasePrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight={600}
                          >
                            {unitPrice(ing)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setEditingId(ing.id);
                                  setShowForm(false);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(ing)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ))}
        </Grid>
      </Grid>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Vista de tarjeta de ingrediente para mobile

function IngredientCard({ ingredient: ing, isEditing, onEdit, onDelete }) {
  return (
    <Card
      sx={{
        border: isEditing ? "2px solid #7c3aed" : "1px solid",
        borderColor: isEditing ? "#7c3aed" : "divider",
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {ing.name}
          </Typography>
          <Chip
            label={UNIT_LABELS[ing.unit] ?? ing.unit}
            size="small"
            sx={{
              backgroundColor: `${UNIT_COLORS[ing.unit] ?? "#6b7280"}15`,
              color: UNIT_COLORS[ing.unit] ?? "#6b7280",
              fontWeight: 700,
            }}
          />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            Cantidad: {ing.purchaseQuantity} {UNIT_LABELS[ing.unit]}
          </Typography>
          <Typography variant="caption" fontWeight={600} color="primary">
            {unitPrice(ing)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Editar
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
}
