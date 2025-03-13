import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
} from "@mui/material";
import LaundryModal from "./modalsUserDashboard/LaundryModal";

const UserDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openLaundryModal, setOpenLaundryModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState("inicio");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.user);
        setData(response.data);
      } catch (error: any) {
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Menú Lateral */}
      <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, bgcolor: "#1e1e1e" }}>
        <Box sx={{ width: 260, height: "100%", bgcolor: "#1e1e1e", color: "white", p: 2 }}>
          <Avatar src={data.user.profile_photo || ""} alt="Foto de perfil" sx={{ width: 80, height: 80, margin: "auto", bgcolor: "#1976d2" }} />
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>{`${data.user.first_name} ${data.user.last_name}`}</Typography>
          <List>
            <ListItem button onClick={() => setSelectedSection("inicio")}> <ListItemText primary="Inicio" /> </ListItem>
            <ListItem button onClick={() => setSelectedSection("pagos")}> <ListItemText primary="Pagos" /> </ListItem>
            <ListItem button onClick={() => setSelectedSection("historial")}> <ListItemText primary="Historial de Pagos" /> </ListItem>
            <ListItem button onClick={() => setSelectedSection("lavanderia")}> <ListItemText primary="Lavandería" /> </ListItem>
          </List>
          <Button variant="contained" color="error" fullWidth sx={{ mt: 2 }} onClick={logout}>Cerrar Sesión</Button>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Dashboard de Usuario</Typography>
          </Toolbar>
        </AppBar>

        <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white", mt: 2 }}>
          {selectedSection === "inicio" && (
            <>
              <Typography variant="h6">Resumen</Typography>
              <Typography variant="body1">Próximo pago: {data.payments.next_due?.month_paid || "No hay pagos futuros"}</Typography>
            </>
          )}

          {selectedSection === "pagos" && (
            <>
              <Typography variant="h6">Pagos Pendientes</Typography>
              {data.payments.pending.map((payment: any) => (
                <Typography key={payment.id}>Mes: {payment.month_paid} - Fecha límite: {payment.payment_date}</Typography>
              ))}
            </>
          )}

          {selectedSection === "historial" && (
            <>
              <Typography variant="h6">Historial de Pagos</Typography>
              {data.payments.history.length > 0 ? (
                data.payments.history.map((month: string) => <Typography key={month}>{month}</Typography>)
              ) : (
                <Typography>No hay pagos registrados.</Typography>
              )}
            </>
          )}

          {selectedSection === "lavanderia" && (
            <>
              <Typography variant="h6">Reservas de Lavandería</Typography>
              {data.laundry.bookings.length > 0 ? (
                data.laundry.bookings.map((booking: any) => (
                  <Typography key={booking.id}>
                    Fecha: {booking.date} | Horario: {booking.time_slot} | Estado: {booking.status}
                  </Typography>
                ))
              ) : (
                <Typography>No tienes reservas activas.</Typography>
              )}
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenLaundryModal(true)}>
                Gestionar Reserva
              </Button>
            </>
          )}
        </Paper>

        {/* Modal para gestionar lavandería */}
        <LaundryModal open={openLaundryModal} handleClose={() => setOpenLaundryModal(false)} />
      </Box>
    </Box>
  );
};

export default UserDashboard;
