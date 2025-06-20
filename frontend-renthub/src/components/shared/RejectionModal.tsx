import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from "@mui/material";
import api from "../../api/api";

interface RejectionModalProps {
  open: boolean;
  onClose: () => void;
  rejectUrl: string; // Ruta del endpoint
  onSuccess: () => void; // Callback tras rechazo exitoso
  title?: string;
  label?: string;
}

export const RejectionModal = ({
  open,
  onClose,
  rejectUrl,
  onSuccess,
  title = "Motivo de Rechazo",
  label = "Explique el motivo del rechazo",
}: RejectionModalProps) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("El motivo es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      await api.post(rejectUrl, { admin_comment: reason.trim() });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al rechazar:", err);
      setError("Error al enviar el rechazo. Verifique e intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={label}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
          {loading ? "Enviando..." : "Rechazar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionModal;
