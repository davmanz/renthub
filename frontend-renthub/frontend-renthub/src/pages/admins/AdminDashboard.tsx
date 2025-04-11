import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import PaymentDetailsModal from "./modals/AdminDashboard/PaymentDetailsModal";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.admin);
        setData(response.data);
      } catch (error) {
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <CircularProgress />
        </Container>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </AdminLayout>
    );
  }

  // Agrupar pagos por usuario
  const userPaymentsSummary = data?.unverified_payments.reduce((acc, payment) => {
    const userId = payment.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        user: payment.user,
        pending: 0,
        inReview: 0,
        payments: [],
      };
    }
    if (payment.status === "pending") {
      acc[userId].pending += 1;
    } else {
      acc[userId].inReview += 1;
    }
    acc[userId].payments.push(payment);
    return acc;
  }, {});

  const usersWithPayments = Object.values(userPaymentsSummary || {});

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Widgets en la misma fila */}
        <Grid container spacing={3}>
          {/* Pagos Pendientes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: "#ffccbc", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" align="center">Pagos Pendientes</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="center"><strong>Total Pagos</strong></Typography>
                    <Typography variant="h5" align="center">{data?.summary.unverified_payments_count ?? 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="center"><strong>Usuarios</strong></Typography>
                    <Typography variant="h5" align="center">{data?.summary.unpaid_users_count ?? 0}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Solicitudes de Lavandería */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: "#d1c4e9", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" align="center">Solicitudes de Lavandería</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="center"><strong>Total</strong></Typography>
                    <Typography variant="h5" align="center">{data?.washing_payments.qtyAll ?? 0}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="center"><strong>Pend. Usuario</strong></Typography>
                    <Typography variant="h5" align="center">{data?.washing_payments.qtyPendingByUser ?? 0}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="center"><strong>Pend. Admin</strong></Typography>
                    <Typography variant="h5" align="center">{data?.washing_payments.qtyPendingByAdmin ?? 0}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Usuarios con Pagos Pendientes */}
        <Typography variant="h6" sx={{ mt: 4 }}>Usuarios con Pagos Pendientes</Typography>
        {usersWithPayments.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                  <TableCell sx={{ color: "white" }}>Pago En Analisis</TableCell>
                  <TableCell sx={{ color: "white" }}>Pagos Vencidos</TableCell>
                  <TableCell sx={{ color: "white" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersWithPayments.map((user) => (
                  <TableRow key={user.user.id}>
                    <TableCell>{user.user.name}</TableCell>
                    <TableCell>{user.pending}</TableCell>
                    <TableCell>{user.inReview}</TableCell>
                    <TableCell>
                    <Tooltip title="Ver Detalles">
                      <IconButton color="primary" onClick={() => { setSelectedUser(user); setOpenModal(true); }}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2 }}>No hay usuarios con pagos pendientes.</Typography>
        )}

        {/* Modal de Detalles de Pagos */}
        <PaymentDetailsModal open={openModal} onClose={() => setOpenModal(false)} user={selectedUser} />

      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
