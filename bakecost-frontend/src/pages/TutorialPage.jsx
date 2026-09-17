import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Inventory2 as IngredientsIcon,
  MenuBook as RecipesIcon,
  Settings as SettingsIcon,
  Calculate as CalculateIcon,
  Percent as PercentIcon,
  TrendingUp as PricingIcon,
  ArrowForward as ArrowIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// ─── Datos de los pasos
const STEPS = [
  {
    number: 1,
    icon: <IngredientsIcon />,
    color: "#7c3aed",
    title: "Registrá tus ingredientes",
    summary:
      "Antes de crear una receta necesitás registrar los ingredientes que vas a utilizar con su precio y cantidad de compra.",
    content: <StepIngredients />,
    action: { label: "Ir a Ingredientes", path: "/ingredients" },
  },
  {
    number: 2,
    icon: <SettingsIcon />,
    color: "#6366f1",
    title: "Configurá tu costo de mano de obra",
    summary:
      "Indicá cuánto vale una hora de tu trabajo. Este valor se usa en todas las recetas.",
    content: <StepLaborCost />,
    action: { label: "Ir a Configuración", path: "/settings" },
  },
  {
    number: 3,
    icon: <RecipesIcon />,
    color: "#a855f7",
    title: "Creá una receta",
    summary:
      "Combiná los ingredientes registrados, indicá el rendimiento y el tiempo de preparación.",
    content: <StepRecipe />,
    action: { label: "Crear receta", path: "/recipes/new" },
  },
  {
    number: 4,
    icon: <PercentIcon />,
    color: "#8b5cf6",
    title: "Considerá los costos indirectos",
    summary:
      "Los costos indirectos representan gastos de producción que no son ingredientes: gas, luz, agua, packaging y otros.",
    content: <StepIndirect />,
    action: null,
  },
  {
    number: 5,
    icon: <CalculateIcon />,
    color: "#5b21b6",
    title: "Consultá el costo de producción",
    summary:
      "BakeCost calcula el desglose completo: ingredientes, mano de obra, costos indirectos, total y costo por unidad.",
    content: <StepCostResult />,
    action: { label: "Ver mis recetas", path: "/recipes" },
  },
  {
    number: 6,
    icon: <PricingIcon />,
    color: "#4c1d95",
    title: "Usá el costo para definir tu precio",
    summary:
      "El costo calculado es la base para determinar el precio de venta de tus productos.",
    content: <StepPricing />,
    action: null,
  },
];

// ─── Componentes de contenido por paso
function StepIngredients() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada ingrediente se registra con el precio y la cantidad que comprás
        habitualmente. BakeCost calcula automáticamente cuánto cuesta la
        cantidad exacta que usás en cada receta, incluso cuando la unidad de
        compra difiere de la unidad de la receta.
      </Typography>

      {/* Ejemplo visual */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Ejemplo de ingrediente
        </Typography>
        <ExampleCard
          rows={[
            { label: "Nombre", value: "Harina 000" },
            { label: "Cantidad comprada", value: "1 kg" },
            { label: "Precio total", value: "$1.500" },
            {
              label: "Precio por kg",
              value: "$1.500 / kg  ←  calculado automáticamente",
            },
          ]}
        />
      </Box>

      <ConversionExample />
    </Box>
  );
}

// Ejemplo de conversión automática de unidades
function ConversionExample() {
  return (
    <Paper
      sx={{
        p: 2,
        background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
        border: "1px solid #ddd6fe",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="primary"
        sx={{ display: "block", mb: 1 }}
      >
        💡 Conversión automática de unidades
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Si compraste <strong>1 kg</strong> de harina por <strong>$1.500</strong>{" "}
        y la receta usa <strong>250 g</strong>, BakeCost convierte
        automáticamente:
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          p: 1.5,
          borderRadius: 1.5,
          backgroundColor: "rgba(124,58,237,0.08)",
          fontFamily: "monospace",
          fontSize: "0.8rem",
          color: "#4c1d95",
        }}
      >
        $1.500 ÷ 1.000 g = $1,50 / g<br />
        $1,50 × 250 g = <strong>$375</strong>
      </Box>
    </Paper>
  );
}

// Costo de mano de obra: horas de preparación × valor hora
function StepLaborCost() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Desde la sección <strong>Configuración</strong> podés establecer cuánto
        vale tu hora de trabajo. Este valor es global y se aplica a todas las
        recetas según las horas de preparación indicadas en cada una.
      </Typography>

      <ExampleCard
        rows={[
          { label: "Valor hora configurado", value: "$2.000 / hora" },
          { label: "Tiempo de preparación", value: "1,5 horas" },
          { label: "Costo de mano de obra", value: "$3.000", highlight: true },
        ]}
      />

      <Paper
        sx={{
          p: 2,
          mt: 2,
          background: "#f5f3ff",
          border: "1px solid #ede9fe",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary"
          sx={{ display: "block", mb: 0.5 }}
        >
          💡 ¿Cómo calcular tu valor hora?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Un punto de partida: dividí el ingreso mensual que querés obtener por
          la cantidad de horas que trabajás al mes.
        </Typography>
      </Paper>
    </Box>
  );
}

function StepRecipe() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Una receta combina los ingredientes que ya registraste. Para cada
        ingrediente indicás la cantidad y la unidad que usás en esa receta
        (puede diferir de la unidad de compra).
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Ejemplo: Medialunas de manteca
        </Typography>
        <ExampleCard
          rows={[
            { label: "Categoría", value: "🥐 Facturas" },
            { label: "Rendimiento", value: "24 unidades" },
            { label: "Tiempo preparación", value: "2 horas" },
            { label: "Harina 000", value: "500 g" },
            { label: "Manteca", value: "200 g" },
            { label: "Azúcar", value: "100 g" },
            { label: "Huevos", value: "2 unidades" },
          ]}
        />
      </Box>

      <Paper
        sx={{
          p: 2,
          background: "#f5f3ff",
          border: "1px solid #ede9fe",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary"
          sx={{ display: "block", mb: 0.5 }}
        >
          📌 Rendimiento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          El rendimiento es la cantidad de unidades que produce la receta
          completa. BakeCost lo usa para calcular el{" "}
          <strong>costo por unidad</strong>.
        </Typography>
      </Paper>
    </Box>
  );
}

function StepIndirect() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Los costos indirectos agrupan gastos de producción que no podés asignar
        directamente a un ingrediente:
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {[
          "⚡ Electricidad",
          "🔥 Gas",
          "💧 Agua",
          "📦 Packaging",
          "🧹 Limpieza",
          "🔧 Mantenimiento",
        ].map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            sx={{
              backgroundColor: "#f5f3ff",
              color: "#7c3aed",
              fontWeight: 600,
              fontSize: "0.78rem",
            }}
          />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        En BakeCost se configuran como un porcentaje sobre el subtotal
        (ingredientes + mano de obra). Son opcionales: podés usar 0% si no
        querés incluirlos.
      </Typography>

      <ExampleCard
        rows={[
          { label: "Costo ingredientes", value: "$8.000" },
          { label: "Mano de obra", value: "$3.000" },
          { label: "Subtotal", value: "$11.000" },
          { label: "Costos indirectos 10%", value: "$1.100", highlight: true },
        ]}
      />
    </Box>
  );
}

function StepCostResult() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Al calcular el costo de una receta, BakeCost muestra el desglose
        completo:
      </Typography>

      {/* Tarjeta de resultado simulada */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #ede9fe",
          mb: 2,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Costo por unidad producida
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>
            $514
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            $12.350 total ÷ 24 unidades
          </Typography>
        </Box>

        {/* Desglose */}
        <Box sx={{ p: 2 }}>
          {[
            { label: "🥚 Ingredientes", value: "$8.250" },
            { label: "👨‍🍳 Mano de obra", value: "$3.000" },
            { label: "🏭 Costos indirectos", value: "$1.125" },
          ].map(({ label, value }) => (
            <Box
              key={label}
              sx={{ display: "flex", justifyContent: "space-between", py: 0.6 }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" fontWeight={700} color="primary">
              💰 Total
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              $12.375
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Los costos se calculan con los precios registrados al momento del
        cálculo. Si actualizás el precio de un ingrediente, podés recalcular la
        receta para obtener el valor actualizado.
      </Typography>
    </Box>
  );
}

function StepPricing() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        BakeCost no solo calcula tu costo de producción, sino que también te
        ayuda a definir el precio de venta automáticamente. Simplemente elegí un
        porcentaje y el sistema calculará al instante tu ganancia estimada y el
        precio de venta sugerido por unidad.
      </Typography>

      <ExampleCard
        rows={[
          { label: "Costo por unidad", value: "$500" },
          { label: "Ganancia deseada 50%", value: "+ $250" },
          {
            label: "Precio de venta sugerido",
            value: "$750  ←  calculado automáticamente",
            highlight: true,
          },
        ]}
      />

      <Paper
        sx={{
          p: 2,
          mt: 2,
          background: "#f5f3ff",
          border: "1px solid #ede9fe",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary"
          sx={{ display: "block", mb: 0.5 }}
        >
          📌 Nota
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aunque BakeCost te sugiere un precio de venta basado en tu porcentaje
          de ganancia, vos tenés el control final. Podés ajustar este porcentaje
          (20%, 50%, 100% o personalizado) en cualquier momento para adaptarte a
          la realidad de tu mercado.
        </Typography>
      </Paper>
    </Box>
  );
}

// ─── Componentes auxiliares
function ExampleCard({ rows }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #ede9fe",
        overflow: "hidden",
      }}
    >
      {rows.map(({ label, value, highlight }, i) => (
        <Box
          key={label}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 0.9,
            backgroundColor: highlight
              ? "#f5f3ff"
              : i % 2 === 0
                ? "#fff"
                : "#faf9ff",
            borderTop: i > 0 ? "1px solid #f3f0ff" : "none",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="caption"
            fontWeight={highlight ? 700 : 600}
            color={highlight ? "primary" : "text.primary"}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Card de cada paso
function StepCard({ step }) {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        mb: 2.5,
        border: "1px solid #ede9fe",
        "&:hover": { boxShadow: "0 6px 24px rgba(124,58,237,0.12)" },
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Banda de color superior */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${step.color}, ${step.color}66)`,
        }}
      />

      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Header del paso */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Número */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {step.number}
            </Box>
            {/* Ícono */}
            <Avatar sx={{ bgcolor: `${step.color}15`, width: 40, height: 40 }}>
              {React.cloneElement(step.icon, {
                sx: { color: step.color, fontSize: 20 },
              })}
            </Avatar>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ lineHeight: 1.3, mb: 0.5 }}
            >
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.summary}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Contenido del paso */}
        {step.content}

        {/* Botón de acción */}
        {step.action && (
          <Box sx={{ mt: 2.5 }}>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowIcon />}
              onClick={() => navigate(step.action.path)}
              sx={{
                borderColor: step.color,
                color: step.color,
                "&:hover": {
                  borderColor: step.color,
                  backgroundColor: `${step.color}0a`,
                },
              }}
            >
              {step.action.label}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card de inicio rápido
function QuickStartCard() {
  const navigate = useNavigate();
  const steps = [
    {
      label: "Agregá tus ingredientes",
      path: "/ingredients",
      color: "#7c3aed",
    },
    {
      label: "Configurá el costo de mano de obra",
      path: "/settings",
      color: "#6366f1",
    },
    { label: "Creá tu primera receta", path: "/recipes/new", color: "#a855f7" },
  ];

  return (
    <Card
      sx={{
        mb: 4,
        background:
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)",
        border: "none",
        boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Círculos decorativos */}
      <Box
        sx={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: 60,
          bottom: -40,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      <CardContent
        sx={{ p: { xs: 2.5, md: 3.5 }, position: "relative", zIndex: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <SchoolIcon sx={{ color: "#c4b5fd", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
            ¿Es tu primera vez usando BakeCost?
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.75)", mb: 2.5 }}
        >
          Seguí estos tres pasos para empezar a calcular el costo real de tus
          recetas:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {steps.map((s, i) => (
            <Box
              key={s.path}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                flexWrap: "wrap",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" },
                transition: "background-color 0.15s",
              }}
              onClick={() => navigate(s.path)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#fff" }}
                >
                  {s.label}
                </Typography>
              </Box>
              <ArrowIcon
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Página principal del tutorial
export default function TutorialPage() {
  // Título dinámico
  useDocumentTitle("Tutorial");
  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <SchoolIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800}>
            Aprendé a usar BakeCost
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Calculá el costo real de tus recetas en pocos pasos.
        </Typography>
      </Box>

      {/* Intro */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
          border: "1px solid #ddd6fe",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          BakeCost calcula el costo de producción de cada receta teniendo en
          cuenta <strong>ingredientes</strong> (con conversión automática de
          unidades), <strong>mano de obra</strong> (horas de trabajo × valor
          hora) y <strong>costos indirectos</strong> (gas, luz, packaging y
          otros gastos). El resultado es el costo total y el{" "}
          <strong>costo por unidad producida</strong>.
        </Typography>
      </Paper>

      {/* Inicio rápido */}
      <QuickStartCard />

      {/* Título sección pasos */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Guía paso a paso
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Cada sección explica una parte del flujo con ejemplos concretos.
        </Typography>
      </Box>

      {/* Pasos */}
      {STEPS.map((step) => (
        <StepCard key={step.number} step={step} />
      ))}
    </Box>
  );
}
