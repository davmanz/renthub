import { ReactNode, useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import endpoints from "../api/endpoints";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from "@mui/material";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUserName(`${response.data.first_name} ${response.data.last_name}`);
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
      <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, bgcolor: "#1e1e1e" }}>
        <Box sx={{ width: 260, height: "100%", display: "flex", flexDirection: "column", bgcolor: "#1e1e1e", color: "white", p: 2 }}>
          {/* Nombre del usuario */}
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            {userName}
          </Typography>
          <Divider sx={{ bgcolor: "white", mb: 2 }} />

          {/* Menú */}
          <List sx={{ flexGrow: 1 }}>

            {/* Panel de Administracion */}
            <ListItem component="button" onClick={() => navigate("/dashboard/admin")}>
              <ListItemText primary="Panel de Administración" />
            </ListItem>

            {/* Crecion de Usuarios */}
            <ListItem component="button" onClick={() => navigate("/dashboard/admin/create-tenant")}>
                <ListItemText primary="Crear Usuario Tenant" />
            </ListItem>

            {/* Crecion de Contratos */}
            <ListItem component="button" onClick={() => navigate("/dashboard/admin/create-contract")}>
                <ListItemText primary="Crear Contrato" />
            </ListItem>

            {/* Crecion de Sitios */}
            <ListItem component="button" onClick={() => navigate("/dashboard/admin/create-sites")}>
                <ListItemText primary="Crear Sitio" />
            </ListItem>

          </List>

          {/* Botón de Cerrar Sesión al final */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Button variant="contained" color="error" fullWidth onClick={logout}>
              Cerrar Sesión
            </Button>
          </Box>
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

        {/* Contenido dinámico del dashboard */}
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
