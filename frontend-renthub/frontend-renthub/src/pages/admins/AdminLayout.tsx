import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import {
  Dashboard,
  People,
  Assignment,
  Apartment,
  LocalLaundryService,
  Logout,
} from "@mui/icons-material";
import { ReactNode, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUserName(`${response.data.first_name} ${response.data.last_name}`);
        setProfilePhoto(response.data.profile_photo);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Barra lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            bgcolor: "#121212",
            color: "white",
            borderRight: "1px solid #333",
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Avatar
            src={profilePhoto || ""}
            alt="Avatar"
            sx={{
              width: 90,
              height: 90,
              margin: "0 auto",
              border: "3px solid #1976d2",
              boxShadow: 3,
            }}
          />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
            {userName || "Administrador"}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: "#444", mb: 2 }} />

        <List>
          <ListItem button onClick={() => navigate("/dashboard/admin")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}><Dashboard /></ListItemIcon>
            <ListItemText primary="Panel de Administración" />
          </ListItem>

          <ListItem button onClick={() => navigate("/dashboard/admin/users")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}><People /></ListItemIcon>
            <ListItemText primary="Gestión de Usuarios" />
          </ListItem>

          <ListItem button onClick={() => navigate("/dashboard/admin/contract")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}><Assignment /></ListItemIcon>
            <ListItemText primary="Gestión de Contratos" />
          </ListItem>

          <ListItem button onClick={() => navigate("/dashboard/admin/sites")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}><Apartment /></ListItemIcon>
            <ListItemText primary="Gestión de Sitios" />
          </ListItem>

          <ListItem button onClick={() => navigate("/dashboard/admin/laundry")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}><LocalLaundryService /></ListItemIcon>
            <ListItemText primary="Gestión de Lavandería" />
          </ListItem>
        </List>

        <Box sx={{ p: 2, mt: "auto" }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<Logout />}
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Dashboard del Administrador
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
