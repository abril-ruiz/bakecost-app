import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { recipeService } from "../services/recipeService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { calculateMarkup } from "../services/costCalculator";

// ─── Helpers para formatear valores monetarios en ARS
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const QUICK_MARGINS = [30, 40, 50, 100];

// Página de cálculo de costos de una receta
export default function RecipeCostPage() {
  // Título dinámico
  useDocumentTitle("Calcular Costos");

  const { id } = useParams();
  const navigate = useNavigate();
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el margen de ganancia (se actualiza en tiempo real)
  const [marginPercentage, setMarginPercentage] = useState(30);
  const [customMargin, setCustomMargin] = useState("");

  useEffect(() => {
    recipeService
      .calculateCost(id)
      .then((data) => {
        setCostData(data);
        setMarginPercentage(data.profitMarginPercentage || 30);
      })
      .catch((err) => setError(err.message ?? "Error al calcular el costo."))
      .finally(() => setLoading(false));
  }, [id]);

  // Recalcular márgenes en tiempo real cuando cambia el porcentaje
  const marginData = useMemo(() => {
    if (!costData) return null;
    try {
      return calculateMarkup(
        costData.totalCost,
        marginPercentage,
        costData.yield,
      );
    } catch (e) {
      return null; // En caso de margen inválido temporalmente
    }
  }, [costData, marginPercentage]);

  const handleMarginChange = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setMarginPercentage(num);
      setCustomMargin("");
    }
  };

  const handleCustomMarginChange = (e) => {
    const val = e.target.value;
    setCustomMargin(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setMarginPercentage(num);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/recipes")}
          sx={{ mb: 2 }}
        >
          Volver a recetas
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!costData || !marginData) return null;

  const {
    ingredientCost,
    laborCost,
    indirectCost,
    totalCost,
    costPerUnit,
    yield: recipeYield,
  } = costData;
  const { sellingPrice, profit, sellingPricePerUnit } = marginData;
  return (
    <Box sx={{ maxWidth: 780, mx: "auto" }}>
      {/* Navegación */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate("/recipes")}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Volver a recetas
      </Button>

      {/* Header de la receta */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <CalculateIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800} color="primary">
            {costData.recipeName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Rinde ${recipeYield} unidad${recipeYield !== 1 ? "es" : ""}`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label="Calculado con precios actuales"
            size="small"
            sx={{
              backgroundColor: "#f5f3ff",
              color: "#7c3aed",
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* ── SECCIÓN DE MARKUP DE GANANCIA ── */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #e9d5ff",
          backgroundColor: "#faf5ff",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
          💰 Configuración de Ganancia
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {QUICK_MARGINS.map((m) => (
            <Chip
              key={m}
              label={`${m}%`}
              onClick={() => handleMarginChange(m)}
              color={marginPercentage === m ? "primary" : "default"}
              variant={marginPercentage === m ? "filled" : "outlined"}
              sx={{ cursor: "pointer", fontWeight: 600, minHeight: 40 }}
            />
          ))}
          <TextField
            size="small"
            label="Personalizado (%)"
            type="number"
            value={customMargin}
            onChange={handleCustomMarginChange}
            error={
              customMargin !== "" &&
              !isNaN(parseFloat(customMargin)) &&
              parseFloat(customMargin) < 0
            }
            helperText={
              customMargin !== "" &&
              !isNaN(parseFloat(customMargin)) &&
              parseFloat(customMargin) < 0
                ? "No puede ser negativo"
                : ""
            }
            sx={{ width: 170 }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Precio de Venta Total
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#166534">
                {formatCurrency(sellingPrice)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Ganancia Estimada
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#7c3aed">
                {formatCurrency(profit)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Precio por Unidad
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#1e40af">
                {formatCurrency(sellingPricePerUnit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Resumen de costos base ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard
            label="Ingredientes"
            value={formatCurrency(ingredientCost)}
            color="#7c3aed"
            icon="🥚"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard
            label="Mano de obra"
            value={formatCurrency(laborCost)}
            color="#6366f1"
            icon="👨‍🍳"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard
            label="Indirectos"
            value={formatCurrency(indirectCost)}
            color="#a855f7"
            icon="🏭"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard
            label="Costo total"
            value={formatCurrency(totalCost)}
            color="#5b21b6"
            icon="💰"
            highlight
          />
        </Grid>
      </Grid>

      {/* ── Desglose de ingredientes ── */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
          Desglose de ingredientes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ingrediente</TableCell>
                <TableCell align="right">Cantidad usada</TableCell>
                <TableCell align="right">Costo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {costData.ingredientDetails.map((detail, idx) => (
                <TableRow
                  key={idx}
                  sx={{ "&:hover": { backgroundColor: "#faf5ff" } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {detail.ingredientName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {detail.quantityUsed} {detail.unitUsed}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(detail.cost)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#f5f3ff" }}>
                <TableCell colSpan={2} align="right">
                  <Typography variant="body2" fontWeight={700} color="primary">
                    Subtotal ingredientes
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} color="primary">
                    {formatCurrency(ingredientCost)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Alert
        severity="info"
        sx={{
          mt: 3,
          borderRadius: 2,
          backgroundColor: "#f5f3ff",
          color: "#5b21b6",
        }}
      >
        Los costos se calcularon con los precios de compra{" "}
        <strong>más recientes</strong>. Si actualizás el precio de un
        ingrediente, este cálculo lo refleja automáticamente.
      </Alert>
    </Box>
  );
}

// ─── Componentes auxiliares
// Tarjeta de resumen de costos
function SummaryCard({ label, value, color, icon, highlight = false }) {
  return (
    <Card
      sx={{
        border: `1px solid ${color}30`,
        background: highlight
          ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
          : `${color}08`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontSize: "1.3rem", lineHeight: 1, mb: 0.5 }}>
          {icon}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          gutterBottom
        >
          {label}
        </Typography>
        <Typography
          variant={highlight ? "subtitle1" : "body1"}
          fontWeight={highlight ? 800 : 700}
          sx={{ color, lineHeight: 1.2 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
// Funcion para mostrar una línea de costo con etiqueta y valor
function CostLine({ label, value, highlight = false }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        variant={highlight ? "subtitle1" : "body2"}
        fontWeight={highlight ? 700 : 400}
        color={highlight ? "primary" : "text.secondary"}
      >
        {label}
      </Typography>
      <Typography
        variant={highlight ? "subtitle1" : "body2"}
        fontWeight={highlight ? 700 : 600}
        color={highlight ? "primary" : "text.primary"}
      >
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
        }).format(value ?? 0)}
      </Typography>
    </Box>
  );
}
