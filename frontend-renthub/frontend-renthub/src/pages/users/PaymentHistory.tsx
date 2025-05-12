import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Visibility, Block } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { DateUtil } from "../../components/utils/DateUtil";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  pending_review: "Pendiente",
  rejected: "Rechazado",
  overdue: "Vencido",
  upcoming: "Futuro",
};

const statusColors: Record<string, "success" | "warning" | "error" | "info"> = {
  approved: "success",
  pending_review: "warning",
  rejected: "error",
  overdue: "error",
  upcoming: "info",
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(endpoints.payments.listRent);
        const ordered = response.data.sort((a, b) =>
          b.month_paid.localeCompare(a.month_paid)
        );
        setPayments(ordered);
      } catch (err) {
        setError("Error al cargar el historial de pagos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleViewVoucher = (url: string) => {
    setVoucherUrl(url);
  };

  const handleCloseVoucher = () => {
    setVoucherUrl(null);
  };

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      <Typography variant="h5" gutterBottom>
        Historial de Pagos
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && payments.length === 0 && (
        <Typography>No hay pagos registrados.</Typography>
      )}

      {!loading && payments.length > 0 && (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#424242" }}>
              <TableCell sx={{ color: "white" }}>Mes</TableCell>
              <TableCell sx={{ color: "white" }}>Fecha de Pago</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Comprobante</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell sx={{ color: "white" }}>
                  {DateUtil.getMonthAndYear(payment.month_paid)}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {payment.payment_date}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <Chip
                    label={statusLabels[payment.status]}
                    color={statusColors[payment.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {payment.receipt_image_url ? (
                    payment.status === "approved" || payment.status === "pending_review" ? (
                      <Tooltip title="Ver comprobante">
                        <IconButton
                          onClick={() => handleViewVoucher(payment.receipt_image_url)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Comprobante no disponible en este estado">
                        <span>
                          <IconButton disabled>
                            <Block sx={{ color: "#888" }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ViewVoucherModal
        open={!!voucherUrl}
        onClose={handleCloseVoucher}
        voucherImage={voucherUrl || ""}
      />
    </Paper>
  );
};

export default PaymentHistory;
