import {
  Box, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Avatar, Button, Typography, Divider, Tooltip, ListItemButton,
} from "@mui/material";
import {
  Home, Assignment, Payments, LocalLaundryService,
  Settings, Logout,
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import {UserInterface} from "../../types/types";


const API_BASE_URL = import.meta.env.VITE_API_URL;
const Sidebar = ({ onSelect }: { onSelect: (section: string) => void }) => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState<UserInterface | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUser(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario.");
      }
    };
    fetchUser();
  }, []);

  return (
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
          src={user?.profile_photo ? `${API_BASE_URL}/${user.profile_photo}` : ""}
          alt={user?.first_name || "Avatar"}
          sx={{
            width: 90,
            height: 90,
            margin: "0 auto",
            border: "3px solid #1976d2",
            boxShadow: 3,
          }}
        />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
          {user ? `${user.first_name} ${user.last_name}` : "Cargando..."}
        </Typography>
        <Typography variant="body2" sx={{ color: "#90caf9" }}>
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "#444", mb: 2 }} />

      <List>
        <ListItem>
          <ListItemButton onClick={() => onSelect("inicio")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton onClick={() => onSelect("contrato")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <Assignment />
            </ListItemIcon>
            <ListItemText primary="Contrato" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton onClick={() => onSelect("pagos")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <Payments />
            </ListItemIcon>
            <ListItemText primary="Pagos" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton onClick={() => onSelect("lavanderia")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <LocalLaundryService />
            </ListItemIcon>
            <ListItemText primary="Lavandería" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton onClick={() => onSelect("configuracion")} sx={{ "&:hover": { bgcolor: "#1e1e1e" } }}>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Tooltip title="Cerrar Sesión">
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<Logout />}
            onClick={logout}
          >
            Salir
          </Button>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
