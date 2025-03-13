import AdminLayout from "./AdminLayout";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

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

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Resumen General
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: "#e3f2fd" }}>
              <CardContent>
                <Typography variant="h6">Pagos Pendientes</Typography>
                <Typography variant="h4">{data?.pending_payments ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: "#c8e6c9" }}>
              <CardContent>
                <Typography variant="h6">Pagos Aprobados</Typography>
                <Typography variant="h4">{data?.approved_payments ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: "#ffccbc" }}>
              <CardContent>
                <Typography variant="h6">Reservas de Lavandería</Typography>
                <Typography variant="h4">{data?.laundry_reservations ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Historial de Pagos Mensuales</Typography>
          <BarChart
            xAxis={[{ scaleType: "band", data: data?.monthly_payments?.months || [] }]}
            series={[{ data: data?.monthly_payments?.values || [] }]}
            width={600}
            height={300}
          />
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;