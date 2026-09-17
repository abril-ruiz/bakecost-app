import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  BakeryDining as BakeryIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
// Página de error 404
export default function NotFoundPage() {
  useDocumentTitle("Página no encontrada");

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 60%, #ddd6fe 100%)",
        p: 2,
        borderRadius: 2,
      }}
    >
      {/* Card con efecto Glassmorphism */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15)",
        }}
      >
        {/* Ícono temático */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
            mb: 3,
            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
          }}
        >
          <BakeryIcon sx={{ fontSize: 50, color: "white" }} />
        </Box>

        {/* Número 404 */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "5rem" },
            fontWeight: 800,
            color: "#7C3AED",
            lineHeight: 1,
            mb: 1,
          }}
        >
          404
        </Typography>

        {/* Título */}
        <Typography
          variant="h4"
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: 2 }}
        >
          Esta página no existe
        </Typography>

        {/* Frase temática */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, fontSize: "1.05rem", lineHeight: 1.6 }}
        >
          Parece que esta receta se nos quemó en el horno.
          <br />
          La ruta que buscás no se encuentra en nuestra cocina.
        </Typography>

        {/* Botón de acción */}
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
            textTransform: "none",
            background: "linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
            "&:hover": {
              background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)",
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Volver al Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
