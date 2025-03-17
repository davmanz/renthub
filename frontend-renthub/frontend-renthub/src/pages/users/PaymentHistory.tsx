import { useEffect, useState } from "react";
import { Typography, Paper, CircularProgress, Alert, Box, Button } from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const PaymentHistory = () => {
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(endpoints.payments.userPayments);
        setPayments(response.data);
      } catch (error) {
        setError("Error al cargar el historial de pagos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      <Typography variant="h5">Historial de Pagos</Typography>
      {payments?.history.length > 0 ? (
        payments.history.map((payment: any) => (
          <Box key={payment.id} sx={{ mt: 2, padding: 2, border: "1px solid gray", borderRadius: 2 }}>
            <Typography><strong>Mes Pagado:</strong> {payment.month_paid}</Typography>
            <Typography><strong>Fecha de Pago:</strong> {payment.payment_date}</Typography>
            <Typography><strong>Estado:</strong> {payment.status}</Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>No hay pagos registrados.</Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary">Subir Comprobante</Button>
      </Box>
    </Paper>
  );
};

export default PaymentHistory;
