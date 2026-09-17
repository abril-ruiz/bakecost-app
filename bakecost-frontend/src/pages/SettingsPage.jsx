import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  School as TutorialIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { configService } from "../services/configService";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Página de configuración
export default function SettingsPage() {
  // Título dinámico
  useDocumentTitle("Configuración");

  const navigate = useNavigate();
  const [laborCost, setLaborCost] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isDirty, setIsDirty] = useState(false); // Indica si hay cambios sin guardar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar el valor de hora de trabajo al montar el componente
  useEffect(() => {
    configService.getLaborCost().then((value) => {
      setLaborCost(value);
      setInputValue(String(value));
    });
  }, []);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0) {
      setSnackbar({
        open: true,
        message: "Ingresá un valor válido mayor o igual a 0.",
        severity: "error",
      });
      return;
    }
    try {
      const saved = await configService.setLaborCost(parsed);
      setLaborCost(saved);
      setInputValue(String(saved));
      setIsDirty(false);
      setSnackbar({
        open: true,
        message: "Valor de hora actualizado correctamente.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message ?? "Error al guardar.",
        severity: "error",
      });
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(v ?? 0);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SettingsIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Configuración
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajustá los parámetros que afectan el cálculo de costos.
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TutorialIcon />}
          onClick={() => navigate("/tutorial")}
          sx={{ flexShrink: 0 }}
        >
          Ver tutorial
        </Button>
      </Box>

      {/* Card: valor hora de trabajo */}
      <Paper elevation={2} sx={{ p: 3.5, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 0.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            👨‍🍳 Valor de la hora de trabajo
          </Typography>
          {!isDirty && laborCost > 0 && (
            <Chip
              label={formatCurrency(laborCost) + "/h"}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Este valor se usa para calcular el costo de mano de obra en todas tus
          recetas. Se multiplica por las horas de preparación indicadas en cada
          receta.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Costo por hora ($)"
            value={inputValue}
            onChange={handleChange}
            type="number"
            size="small"
            sx={{ flex: 1, minWidth: 180 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ step: "50", min: "0" }} />
                  </InputAdornment>
                ),
              },
            }}
            placeholder="Ej: 1500"
            helperText="Ingresá el valor en pesos argentinos"
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty}
            sx={{ mt: 0.2 }}
          >
            Guardar
          </Button>
        </Box>

        {isDirty && (
          <Alert
            severity="warning"
            sx={{ mt: 2, borderRadius: 2 }}
            icon={false}
          >
            Tienes cambios sin guardar.
          </Alert>
        )}
      </Paper>

      {/* Info sobre el cálculo */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
          border: "1px solid #ddd6fe",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <InfoIcon sx={{ color: "#7c3aed", mt: 0.2, fontSize: "1.2rem" }} />
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                ¿Cómo se usa este valor?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Cuando calculás el costo de una receta, el sistema hace:
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderRadius: 1.5,
                  p: 1.5,
                  fontFamily: "monospace",
                  fontSize: "0.78rem",
                  color: "#4c1d95",
                  overflowX: "auto",
                  m: 0,
                }}
              >
                {`Costo mano de obra =\n  horas de preparación × valor hora\n\nCostos indirectos =\n  (ingredientes + mano de obra) × % indirectos`}
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                <strong>Sugerencia:</strong> Calculá tu costo hora teniendo en
                cuenta lo que querés ganar por mes dividido las horas que
                trabajás.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sección sobre datos locales */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          💾 Almacenamiento local
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Todos tus datos (ingredientes, recetas y configuración) se guardan
          únicamente en este navegador. Nadie más puede ver tu información.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Si limpiás los datos del navegador o usás otro dispositivo, los datos
          no estarán disponibles.
        </Typography>
      </Paper>

      {/* Snackbar para mostrar mensajes de éxito o error */}
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
