import { useState, useEffect, lazy, Suspense } from "react";
import { 
  Box, AppBar, Toolbar, Typography, Paper, Breadcrumbs,
  Link, Fade, IconButton, Menu,
  MenuItem, Chip, Skeleton, Container, alpha,
  Badge, Tooltip
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  NavigateNext, Notifications, AccountCircle, Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useDashboard } from "../../components/shared/DashboardContext"; // Ajusta la ruta
import Sidebar from "./Sidebar";

// Lazy load de las secciones del dashboard
const ProfileSummary = lazy(() => import("./ProfileSummary"));
const ContractInfo = lazy(() => import("./ContractInfo"));
const PaymentHistory = lazy(() => import("./PaymentHistory"));
const LaundryBookings = lazy(() => import("./LaundryBookings"));
const ChangePassword = lazy(() => import("./SettingsPage"));

// Tema único
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { 
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#42a5f5'
    },
    secondary: {
      main: '#81c784',
      light: '#a5d6a7',
      dark: '#66bb6a'
    },
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0aec0'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    }
  }
});

interface SectionConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const UserDashboard = () => {
  const { overdueCount } = useDashboard();
  const [selectedSection, setSelectedSection] = useState("inicio");
  const [loadingSection, setLoadingSection] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setLoadingSection(true);
    const timer = setTimeout(() => {
      setLoadingSection(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedSection]);

  const sectionConfig: Record<string, SectionConfig> = {
    inicio: {
      name: "Dashboard Principal",
      icon: <DashboardIcon />,
      description: "Resumen general de tu cuenta",
      color: "#64b5f6"
    },
    perfil: {
      name: "Mi Perfil",
      icon: <AccountCircle />,
      description: "Información personal y configuración",
      color: "#81c784"
    },
    contrato: {
      name: "Información del Contrato",
      icon: <DashboardIcon />,
      description: "Detalles de tu contrato de residencia",
      color: "#ffb74d"
    },
    pagos: {
      name: "Historial de Pagos",
      icon: <DashboardIcon />,
      description: "Registro de pagos y facturas",
      color: "#f06292"
    },
    lavanderia: {
      name: "Servicio de Lavandería",
      icon: <DashboardIcon />,
      description: "Reservas y estado del servicio",
      color: "#ba68c8"
    },
    configuracion: {
      name: "Configuración",
      icon: <DashboardIcon />,
      description: "Ajustes de cuenta y seguridad",
      color: "#ff8a65"
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "inicio":
        return <ProfileSummary />;
      case "perfil":
        return <ProfileSummary />;
      case "contrato":
        return <ContractInfo />;
      case "pagos":
        return <PaymentHistory />;
      case "lavanderia":
        return <LaundryBookings />;
      case "configuracion":
        return <ChangePassword />;
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              Sección no encontrada
            </Typography>
          </Box>
        );
    }
  };

  const renderSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="rectangular" width="30%" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width="30%" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width="30%" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );

  const currentSection = sectionConfig[selectedSection];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: "flex", 
        height: "100vh", 
        bgcolor: "background.default",
        overflow: 'hidden'
      }}>
        <Sidebar 
          onSelect={setSelectedSection} 
          activeSection={selectedSection}
        />

        <Box component="main" sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header mejorado */}
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              color: 'text.primary'
            }}
          >
            <Toolbar sx={{ px: 3, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(currentSection?.color || '#64b5f6', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    color: currentSection?.color || '#64b5f6'
                  }}
                >
                  {currentSection?.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {currentSection?.name || "Dashboard"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {currentSection?.description || "Panel de control principal"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Notificaciones">
                  <IconButton color="inherit">
                    <Badge badgeContent={overdueCount} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Menu de usuario */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleMenuClose}>Mi Perfil</MenuItem>
            <MenuItem onClick={handleMenuClose}>Configuración</MenuItem>
            <MenuItem onClick={handleMenuClose}>Cerrar Sesión</MenuItem>
          </Menu>

          {/* Breadcrumbs mejorados */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              sx={{ 
                '& .MuiBreadcrumbs-separator': {
                  color: 'text.secondary'
                }
              }}
            >
              <Link 
                color="inherit" 
                href="#"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DashboardIcon fontSize="small" />
                  Dashboard
                </Box>
              </Link>
              <Chip
                label={currentSection?.name || "Inicio"}
                size="small"
                sx={{
                  bgcolor: alpha(currentSection?.color || '#64b5f6', 0.1),
                  color: currentSection?.color || '#64b5f6',
                  fontWeight: 500
                }}
              />
            </Breadcrumbs>
          </Box>

          {/* Contenido principal */}
          <Container 
            maxWidth={false} 
            sx={{ 
              flexGrow: 1, 
              py: 3, 
              px: 3,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Fade in={!loadingSection} timeout={600}>
              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  p: 0,
                  bgcolor: "background.paper",
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`,
                  position: "relative",
                  overflow: 'hidden'
                }}
              >
                {loadingSection ? (
                  renderSkeleton()
                ) : (
                  <Suspense fallback={renderSkeleton()}>
                    <Box sx={{ 
                      height: '100%',
                      overflow: 'auto',
                      position: 'relative'
                    }}>
                      {renderSection()}
                    </Box>
                  </Suspense>
                )}
              </Paper>
            </Fade>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UserDashboard;