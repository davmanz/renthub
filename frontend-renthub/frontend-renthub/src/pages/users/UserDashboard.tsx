import { useState, useEffect, lazy, Suspense } from "react";
import { Box, AppBar, Toolbar, Typography, Paper, Breadcrumbs,
  Link, CircularProgress, Fade
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Sidebar from "./Sidebar";

// Lazy load de las secciones del dashboard
const ProfileSummary = lazy(() => import("./ProfileSummary"));
const ContractInfo = lazy(() => import("./ContractInfo"));
const PaymentHistory = lazy(() => import("./PaymentHistory"));
const LaundryBookings = lazy(() => import("./LaundryBookings"));
const ChangePassword = lazy(() => import("./SettingsPage"));

// Tema personalizado oscuro
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: '#1976d2' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const UserDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("inicio");
  const [loadingSection, setLoadingSection] = useState(true);

  useEffect(() => {
    setLoadingSection(true);
    const timer = setTimeout(() => {
      setLoadingSection(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSection]);

  const sectionNames = {
    inicio: "Inicio",
    contrato: "Contrato",
    pagos: "Historial de Pagos",
    lavanderia: "Reservas de Lavandería",
    configuracion: "Configuración"
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "inicio":
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
        return <Typography>Sección no encontrada</Typography>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        <Sidebar onSelect={setSelectedSection} />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <AppBar position="static" sx={{ bgcolor: "primary.main", borderRadius: 1, mb: 2 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Dashboard de Usuario
              </Typography>
            </Toolbar>
          </AppBar>

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link color="inherit" href="#">
              Dashboard
            </Link>
            <Typography color="text.primary">
              {sectionNames[selectedSection]}
            </Typography>
          </Breadcrumbs>

          <Fade in={!loadingSection} timeout={500}>
            <Paper
              elevation={3}
              sx={{
                padding: 3,
                bgcolor: "background.paper",
                minHeight: "70vh",
                position: "relative"
              }}
            >
              {loadingSection ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    minHeight: "200px"
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Suspense
                  fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <CircularProgress />
                    </Box>
                  }
                >
                  {renderSection()}
                </Suspense>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default UserDashboard;
