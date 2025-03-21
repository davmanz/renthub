import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Tooltip
} from "@mui/material";
import { Visibility, Check, Close } from "@mui/icons-material";
import ViewVoucherModal from "./ViewVoucherModal";
import RejectPaymentModal from "./RejectPaymentModal"
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const PaymentDetailsModal = ({ open, onClose, user }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  if (!user) return null;

  const getPaymentStatus = (payment) => {
    if (payment.status === "pending") return "En Análisis";
    if (payment.status === "overdue") return "Vencido";
    if (payment.status === "approved") return "Aprobado";
    return "Desconocido";
  };

  const handleApprove = async (paymentId) => {
    try {
      await api.post(endpoints.payments.approve(paymentId));
      setSnackbar({ open: true, message: "Pago aprobado correctamente.", severity: "success" });

      // Actualizar estado local
      const updatedPayments = user.payments.map((p) =>
        p.id === paymentId ? { ...p, status: "approved" } : p
      );
      user.payments = updatedPayments;
    } catch (error) {
      console.error("Error al aprobar el pago:", error);
      setSnackbar({ open: true, message: "Error al aprobar el pago.", severity: "error" });
    }
  };

  const handleOpenReject = (payment) => {
    setSelectedPayment(payment);
    setOpenRejectModal(true);
  };

  const handleRejected = () => {
    // Actualizar estado local
    const updatedPayments = user.payments.map((p) =>
      p.id === selectedPayment.id ? { ...p, status: "rejected" } : p
    );
    user.payments = updatedPayments;

    setSnackbar({ open: true, message: "Pago rechazado correctamente.", severity: "info" });
    setOpenRejectModal(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Detalles de Pagos de {user.name}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contrato</TableCell>
                  <TableCell>Mes Pagado</TableCell>
                  <TableCell>Fecha de Pago</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{`${payment.contract.building} - Habitación ${payment.contract.room_number}`}</TableCell>
                    <TableCell>{payment.month_paid}</TableCell>
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentStatus(payment)}
                        color={
                          payment.status === "overdue" ? "error" :
                          payment.status === "pending" ? "info" :
                          "success"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {payment.status === "pending" && (
                        <>
                          <Tooltip title="Ver Comprobante">
                            <IconButton color="primary" onClick={() => { setSelectedPayment(payment); setOpenVoucherModal(true); }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Aprobar Pago">
                            <IconButton color="success" onClick={() => handleApprove(payment.id)}>
                              <Check />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Rechazar Pago">
                            <IconButton color="error" onClick={() => handleOpenReject(payment)}>
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de comprobante */}
      <ViewVoucherModal
        open={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        request={selectedPayment}
      />

      {/* Modal de rechazo */}
      <RejectPaymentModal
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        payment={selectedPayment}
        onRejected={handleRejected}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentDetailsModal;
