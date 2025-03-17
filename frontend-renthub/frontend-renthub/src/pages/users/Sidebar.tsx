import { Box, Drawer, List, ListItem, ListItemText, Avatar, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ onSelect }: { onSelect: (section: string) => void }) => {
  const { logout } = useContext(AuthContext);

  return (
    <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, bgcolor: "#1e1e1e" }}>
      <Box sx={{ width: 260, height: "100%", bgcolor: "#1e1e1e", color: "white", p: 2 }}>
        <Avatar sx={{ width: 80, height: 80, margin: "auto", bgcolor: "#1976d2" }} />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>Usuario</Typography>
        <List>
          <ListItem button onClick={() => onSelect("inicio")}> <ListItemText primary="Inicio" /> </ListItem>
          <ListItem button onClick={() => onSelect("contrato")}> <ListItemText primary="Información del Contrato" /> </ListItem>
          <ListItem button onClick={() => onSelect("pagos")}> <ListItemText primary="Historial de Pagos" /> </ListItem>
          <ListItem button onClick={() => onSelect("lavanderia")}> <ListItemText primary="Lavandería" /> </ListItem>
          <ListItem button onClick={() => onSelect("configuracion")}> <ListItemText primary="Configuración" /> </ListItem>
        </List>
        <Button variant="contained" color="error" fullWidth sx={{ mt: 2 }} onClick={logout}>Cerrar Sesión</Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
