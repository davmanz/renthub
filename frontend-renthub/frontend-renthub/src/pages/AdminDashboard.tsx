import AdminLayout from "./AdminLayout";
import api from "../api/api";
import endpoints from "../api/endpoints";
import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Typography
} from "@mui/material";

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.admin);
        setData(response.data);
      } catch (error: any) {
        console.error("Error al obtener el dashboard del administrador", error);
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <CircularProgress />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error">{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 3, mb: 2, color: "#1976d2" }}>
          Resumen de Pagos
        </Typography>

        {/* Tabla de Pagos No Verificados */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Pagos No Verificados
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>ID Pago</TableCell>
                <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.unverified_payments?.map((payment: any) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.user}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Tabla de Pagos de Arriendo */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Pagos de Arriendo
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Habitación</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white" }}>Periodo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.rental_payments?.map((rental: any) => (
                <TableRow key={rental.id} hover>
                  <TableCell>{rental.room_number}</TableCell>
                  <TableCell>{rental.payment_date}</TableCell>
                  <TableCell>{rental.month_paid}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
