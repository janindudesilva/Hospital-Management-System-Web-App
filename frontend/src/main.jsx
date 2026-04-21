import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4318FF',
      light: '#6544FF',
      dark: '#2B129E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F4F7FE',
      contrastText: '#2B3674',
    },
    success: {
      main: '#05CD99',
      light: '#43F6C3',
      dark: '#04A076',
    },
    warning: {
      main: '#FFCE20',
      light: '#FFE066',
      dark: '#D9AB00',
    },
    error: {
      main: '#EE5D50', 
      light: '#FF8A80',
      dark: '#B7372B',
    },
    info: {
      main: '#39B8FF',
      light: '#7AD4FF',
      dark: '#0090E6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F7FE',
      paper: '#ffffff',
    },
    text: {
      primary: '#2B3674',
      secondary: '#A3AED0',
    },
    divider: '#E0E5F2',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8, // Structured borders
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px -10px rgba(67, 24, 255, 0.4)',
          },
        },
        containedPrimary: {
          backgroundColor: '#4318FF',
          '&:hover': {
            backgroundColor: '#2B129E',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#E0E5F2',
          color: '#2B3674',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#4318FF',
            backgroundColor: 'transparent',
            color: '#4318FF',
            boxShadow: 'none',
            transform: 'none',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F7FE',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.05)',
          border: 'none',
          borderRadius: 20,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.05)',
          border: 'none',
          backgroundColor: '#ffffff',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 30px 0px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '&.Mui-focused': {
               boxShadow: '0 0 0 3px rgba(18, 101, 168, 0.15)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: '#1265A8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #E0E5F2',
          backgroundColor: '#ffffff',
          color: '#2B3674',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 16px',
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#F4F7FE',
            transform: 'none',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(67, 24, 255, 0.08)',
            color: '#4318FF',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: 'rgba(67, 24, 255, 0.12)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                color: 'inherit',
                minWidth: '36px',
            }
        }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#A3AED0',
          borderBottom: '1px solid #E0E5F2',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        body: {
          fontSize: '0.875rem',
          borderBottom: '1px solid #E0E5F2',
          color: '#2B3674',
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.875rem',
          backgroundColor: '#4318FF',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
