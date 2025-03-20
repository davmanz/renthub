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
  Paper
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import ViewVoucherModal from "./ViewVoucherModal";

const PaymentDetailsModal = ({ open, onClose, user }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);

  if (!user) return null;

  const getPaymentStatus = (payment) => {
    if (payment.status === "pending" && payment.receipt_image) {
      return "En Análisis";
    }
    if (payment.status === "overdue") {
      return "Vencido";
    }
    if (payment.status === "approved") {
      return "Aprobado";
    }
    return "Desconocido";
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
                      {payment.receipt_image && (
                        <IconButton color="primary" onClick={() => { setSelectedPayment(payment); setOpenVoucherModal(true); }}>
                          <Visibility />
                        </IconButton>
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

      <ViewVoucherModal open={openVoucherModal} onClose={() => setOpenVoucherModal(false)} request={selectedPayment} />
    </>
  );
};

export default PaymentDetailsModal;
