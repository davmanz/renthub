import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import endpoints from "../api/endpoints";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Box,
  Button,
} from "@mui/material";
import LaundryModal from "./modalsUserDashboard/LaundryModal"; // Importamos el modal

const UserDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [openLaundryModal, setOpenLaundryModal] = useState(false);

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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3, bgcolor: "#1e1e1e", color: "white", display: "flex", alignItems: "center" }}>
        {/* Foto de Perfil */}
        <Avatar
          src={data.user.profile_photo || ""}
          alt="Foto de perfil"
          sx={{ width: 80, height: 80, marginRight: 2, bgcolor: "#1976d2" }}
        />

        {/* Datos del Usuario */}
        <Box>
          <Typography variant="h5">{`${data.user.first_name} ${data.user.last_name}`}</Typography>
          <Typography variant="body1">Correo: {data.user.email}</Typography>
          <Typography variant="body2" color="gray">
            Teléfono: {data.user.phone_number}
          </Typography>
        </Box>

        {/* Botón de Cerrar Sesión */}
        <Button variant="contained" color="error" sx={{ ml: "auto" }} onClick={logout}>
          Cerrar Sesión
        </Button>
      </Paper>

      {/* Barra de Navegación */}
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        indicatorColor="primary"
        textColor="inherit"
        variant="fullWidth"
        sx={{ bgcolor: "#1e1e1e", color: "white", marginTop: 2 }}
      >
        <Tab label="Inicio" />
        <Tab label="Pagos Pendientes" />
        <Tab label="Historial de Pagos" />
        <Tab label="Lavandería" />
      </Tabs>

      {/* Contenido del Dashboard */}
      <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white", mt: 2 }}>
        {selectedTab === 0 && (
          <>
            <Typography variant="h6">Resumen</Typography>
            <Typography variant="body1">Próximo pago: {data.next_payment?.month_paid || "No hay pagos futuros"}</Typography>
          </>
        )}

        {selectedTab === 3 && (
          <>
            <Typography variant="h6">Reservas de Lavandería</Typography>
            {data.laundry_booking ? (
              <>
                <Typography variant="body1">Fecha: {data.laundry_booking.date}</Typography>
                <Typography variant="body1">Horario: {data.laundry_booking.time_slot}</Typography>
                <Typography variant="body1">Estado: {data.laundry_booking.status}</Typography>
              </>
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
    </Container>
  );
};

export default UserDashboard;
