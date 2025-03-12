import { useEffect, useState } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";
import { Container, Paper, Typography, CircularProgress, Alert, Avatar, Tabs, Tab, Box } from "@mui/material";
import UploadPaymentModal from "./modalsUserDashboard/UploadPaymentModal";

const UserDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.user);
        setData(response.data);
      } catch (error: any) {
        console.error("Error al obtener el dashboard", error);
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
      {/* Contenedor del Header */}
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
        <Tab label="Configuración" />
      </Tabs>

      {/* Contenido del Dashboard */}
      <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white", mt: 2 }}>
        {selectedTab === 0 && (
          <>
            <Typography variant="h6">Resumen</Typography>
            <Typography variant="body1">Próximo pago: {data.next_payment?.month_paid || "No hay pagos futuros"}</Typography>
          </>
        )}

        {selectedTab === 1 && (
          <>
            <Typography variant="h6">Pagos Pendientes</Typography>
            {data.payments_pending.length > 0 ? (
              data.payments_pending.map((payment: any) => (
                <Typography key={payment.id} variant="body1">
                  - {payment.month_paid} (Vence: {payment.payment_date})
                </Typography>
              ))
            ) : (
              <Typography>No tienes pagos pendientes.</Typography>
            )}
          </>
        )}

        {selectedTab === 2 && (
          <>
            <Typography variant="h6">Historial de Pagos</Typography>
            <Typography variant="body1">Aquí se mostrará el historial de pagos (por implementar).</Typography>
          </>
        )}

        {selectedTab === 3 && (
          <>
            <Typography variant="h6">Configuración</Typography>
            <Typography variant="body1">Opciones de usuario (por implementar).</Typography>
          </>
        )}
      </Paper>

      {/* Modal para subir comprobantes */}
      <UploadPaymentModal open={modalOpen} onClose={() => setModalOpen(false)} nextPayment={data.next_payment?.next_month} />
    </Container>
  );
};

export default UserDashboard;
