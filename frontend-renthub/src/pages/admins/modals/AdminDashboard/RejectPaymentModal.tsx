import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const RejectPaymentModal = ({ open, onClose, payment, onRejected }) => {
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!payment || !reason.trim()) return;

    try {
      await api.post(endpoints.payments.rejectRent(payment.id), {
        admin_comment: reason,
      });

      onRejected(); // Refrescar pagos en el modal padre
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error al rechazar el pago:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Rechazar Pago</DialogTitle>
      <DialogContent>
        <TextField
          label="Motivo del rechazo"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleReject} color="error" variant="contained" disabled={!reason.trim()}>
          Rechazar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectPaymentModal;
