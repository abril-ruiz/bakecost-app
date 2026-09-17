import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";

const DRAWER_WIDTH = 260;

// Componente que incluye la barra de navegación y un contenedor para el contenido principal, con padding responsivo.
export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0, // evita overflow horizontal en contenedores flex
          width: "100%",
          mt: isMobile ? "64px" : 0,
          minHeight: "100vh",
          // Padding responsivo: compacto en mobile, amplio en desktop
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
