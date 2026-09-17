import { createTheme } from '@mui/material/styles';

/**
 * Tema global de BakeCost.
 * Paleta principal: violetas/lilas.
 * Tipografía: Inter (sans-serif moderna, legible).
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#c4b5fd',   // violet-300
      main: '#7c3aed',    // violet-600
      dark: '#5b21b6',    // violet-800
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#f0abfc',   // fuchsia-300
      main: '#a855f7',    // purple-500
      dark: '#7e22ce',    // purple-800
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f3ff', // violet-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b4b',   // indigo-950
      secondary: '#6b7280', // gray-500
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#6366f1', // indigo-500
    },
    divider: '#ede9fe', // violet-100
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    // --- AppBar ---
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)',
          boxShadow: '0 2px 20px rgba(124, 58, 237, 0.25)',
        },
      },
    },

    // --- Button ---
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
          },
        },
      },
    },

    // --- Card ---
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 12px rgba(124, 58, 237, 0.08)',
          border: '1px solid #ede9fe',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(124, 58, 237, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    // --- Paper ---
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation3: {
          boxShadow: '0 4px 24px rgba(124, 58, 237, 0.10)',
        },
      },
    },

    // --- Chip ---
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },

    // --- TextField ---
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7c3aed',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7c3aed',
            },
          },
        },
      },
    },

    // --- Table ---
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f3ff',
            color: '#5b21b6',
            fontWeight: 700,
          },
        },
      },
    },

    // --- Divider ---
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#ede9fe',
        },
      },
    },

    // --- Alert ---
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    // --- Drawer ---
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #4c1d95 0%, #5b21b6 100%)',
          color: '#ffffff',
        },
      },
    },
  },
});

export default theme;
