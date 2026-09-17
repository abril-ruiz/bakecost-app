import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory2 as IngredientsIcon,
  MenuBook as RecipesIcon,
  Settings as SettingsIcon,
  School as TutorialIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Ingredientes", path: "/ingredients", icon: <IngredientsIcon /> },
  { label: "Recetas", path: "/recipes", icon: <RecipesIcon /> },
  { label: "Tutorial", path: "/tutorial", icon: <TutorialIcon /> },
  { label: "Configuración", path: "/settings", icon: <SettingsIcon /> },
];
// Navbar con drawer lateral (desktop) o temporal (mobile)
export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header del drawer */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: "#fff", letterSpacing: "-0.5px" }}
          >
            🍞 BakeCost
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}
          >
            Calculadora de costos
          </Typography>
        </Box>
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mx: 2 }} />

      {/* Links de navegación */}
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.10)" },
                  transition: "background-color 0.15s",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                    minWidth: 38,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primarytypographyprops={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.925rem",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: "#c4b5fd",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer del drawer */}
      <Box sx={{ p: 2.5 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2 }} />
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}
        >
          BakeCost v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* AppBar visible solo en mobile */}
      {isMobile && (
        <AppBar position="fixed" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              🍞 BakeCost
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer — permanente en desktop, temporal en mobile */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
