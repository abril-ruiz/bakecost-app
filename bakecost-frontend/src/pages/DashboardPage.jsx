import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Inventory2 as IngredientsIcon,
  MenuBook as RecipesIcon,
  Calculate as CalculateIcon,
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ingredientService } from "../services/ingredientService";
import { recipeService } from "../services/recipeService";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

//  Helpers
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const categoryLabels = {
  TORTA: "Torta",
  PAN: "Pan",
  FACTURAS: "Facturas",
  GALLETITAS: "Galletitas",
  BUDIN: "Budín",
  POSTRE: "Postre",
  OTRO: "Otro",
};

// Tarjeta de estadísticas con icono, valor y acción opcional
function StatCard({ icon, label, value, color, onClick, actionLabel }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        height: "100%",
        background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        "&:hover": onClick
          ? {
              boxShadow: `0 8px 28px ${color}28`,
              transform: "translateY(-3px)",
            }
          : {},
      }}
    >
      {/* Contenido de la tarjeta */}
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              gutterBottom
            >
              {label}
            </Typography>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color, lineHeight: 1 }}
            >
              {value}
            </Typography>
            {actionLabel && (
              <Typography
                variant="caption"
                sx={{ color, fontWeight: 600, mt: 1, display: "block" }}
              >
                {actionLabel} →
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, width: 52, height: 52 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

// Banner principal con mensaje de bienvenida y botones de acción rápida
function HeroBanner() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        minHeight: 220,
        background:
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a855f7 100%)",
        display: "flex",
        alignItems: "center",
        px: { xs: 3, md: 5 },
        mb: 4,
        boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
      }}
    >
      {/* Círculos decorativos tipo glassmorphism */}
      <Box
        sx={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: 80,
          bottom: -60,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 520 }}>
        <Chip
          label="🍞 Panadería & Pastelería"
          size="small"
          sx={{
            backgroundColor: "rgba(255,255,255,0.18)",
            color: "#fff",
            fontWeight: 600,
            mb: 1.5,
            backdropFilter: "blur(8px)",
          }}
        />
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ color: "#fff", mb: 1, lineHeight: 1.2 }}
        >
          Controlá tus costos,
          <br />
          mejorá tus márgenes.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.75)", mb: 2.5 }}
        >
          Calculá el costo real de cada receta incluyendo ingredientes, mano de
          obra y gastos indirectos.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/recipes/new")}
            sx={{
              backgroundColor: "#fff",
              color: "#7c3aed",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#ede9fe" },
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            Nueva receta
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/ingredients")}
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "#fff",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Mis ingredientes
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// Recetas recientes
const categoryColors = {
  TORTA: "#7c3aed",
  PAN: "#22c55e",
  FACTURAS: "#f59e0b",
  GALLETITAS: "#6366f1",
  BUDIN: "#ef4444",
  POSTRE: "#a855f7",
  OTRO: "#6b7280",
};

function RecentRecipes({ recipes, onCalculate }) {
  const navigate = useNavigate();
  const recent = recipes.slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <Card sx={{ mt: 0 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} color="primary">
            Recetas recientes
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/recipes")}
            sx={{ fontWeight: 600 }}
          >
            Ver todas →
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {recent.map((recipe) => (
            <Box
              key={recipe.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { backgroundColor: "#f5f3ff" },
                transition: "background-color 0.15s",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    backgroundColor: `${categoryColors[recipe.category] ?? "#6b7280"}18`,
                    color: categoryColors[recipe.category] ?? "#6b7280",
                    flexShrink: 0,
                  }}
                >
                  {recipe.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {recipe.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {categoryLabels[recipe.category] ?? recipe.category} ·{" "}
                    {recipe.yield} u.
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  <CalculateIcon sx={{ fontSize: "0.9rem !important" }} />
                }
                onClick={() => navigate(`/recipes/${recipe.id}/cost`)}
                sx={{ flexShrink: 0, ml: 1, fontSize: "0.75rem" }}
              >
                Calcular
              </Button>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Acciones rápidas: botones para ir a las secciones más importantes

function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    {
      icon: "🥚",
      label: "Agregar ingrediente",
      desc: "Registrá precios de compra",
      onClick: () => navigate("/ingredients"),
      color: "#7c3aed",
    },
    {
      icon: "📋",
      label: "Crear receta",
      desc: "Armá una nueva receta",
      onClick: () => navigate("/recipes/new"),
      color: "#a855f7",
    },
    {
      icon: "⚙️",
      label: "Configuración",
      desc: "Ajustá el valor hora",
      onClick: () => navigate("/settings"),
      color: "#6366f1",
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
          Acciones rápidas
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {actions.map((a) => (
            <Box
              key={a.label}
              onClick={a.onClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                border: "1px solid transparent",
                "&:hover": {
                  backgroundColor: `${a.color}0a`,
                  borderColor: `${a.color}30`,
                },
                transition: "all 0.15s",
              }}
            >
              <Box sx={{ fontSize: "1.4rem", lineHeight: 1 }}>{a.icon}</Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {a.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {a.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Consejos contextuales según la cantidad de ingredientes y recetas registradas
function TipCard({ ingredientCount, recipeCount }) {
  let tip;
  if (ingredientCount === 0) {
    tip = {
      icon: "💡",
      title: "Empezá por los ingredientes",
      text: "Antes de crear recetas, registrá los ingredientes que usás con su precio y cantidad de compra.",
    };
  } else if (recipeCount === 0) {
    tip = {
      icon: "🎯",
      title: "¡Ya tenés ingredientes!",
      text: "Ahora podés crear tu primera receta y calcular su costo real incluyendo mano de obra.",
    };
  } else {
    tip = {
      icon: "📊",
      title: "Consejo de costeo",
      text: "Revisá el porcentaje de costos indirectos de cada receta. Un 15–20% suele cubrir gas, luz y packaging.",
    };
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
        border: "1px solid #ddd6fe",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box sx={{ fontSize: "1.6rem", lineHeight: 1, mt: 0.2 }}>
            {tip.icon}
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              {tip.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tip.text}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Página principal del panel de control
export default function DashboardPage() {
  // Título dinámico
  useDocumentTitle("Dashboard");

  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    ingredientService.getAll().then(setIngredients);
    recipeService.getAll().then(setRecipes);
  }, []);

  const totalIngredients = ingredients.length;
  const totalRecipes = recipes.length;
  const categoryCount = new Set(recipes.map((r) => r.category)).size;

  return (
    <Box>
      {/* Saludo contextual */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          Panel de control
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Calculá y gestioná los costos de tu producción.
        </Typography>
      </Box>

      {/* Hero */}
      <HeroBanner />

      {/* Estadísticas */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<IngredientsIcon />}
            label="Ingredientes registrados"
            value={totalIngredients}
            color="#7c3aed"
            onClick={() => navigate("/ingredients")}
            actionLabel="Ver ingredientes"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<RecipesIcon />}
            label="Recetas creadas"
            value={totalRecipes}
            color="#a855f7"
            onClick={() => navigate("/recipes")}
            actionLabel="Ver recetas"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<TrophyIcon />}
            label="Categorías distintas"
            value={categoryCount}
            color="#6366f1"
          />
        </Grid>
      </Grid>

      {/* Contenido principal — 2 columnas en desktop */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {recipes.length > 0 ? (
            <RecentRecipes recipes={recipes} />
          ) : (
            <Card
              sx={{
                background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                border: "1px solid #ddd6fe",
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ fontSize: "3rem", mb: 1.5 }}>🍰</Box>
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
                  sx={{ mb: 2.5 }}
                >
                  Crea tu primera receta para empezar a calcular costos reales.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/recipes/new")}
                >
                  Crear primera receta
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TipCard
              ingredientCount={totalIngredients}
              recipeCount={totalRecipes}
            />
            <QuickActions />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
