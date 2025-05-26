import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const RejectLaundryModal = ({ open, onClose, request, onReject }) => {
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = async () => {
    if (!request || !rejectReason.trim()) return;
    await api.post(endpoints.laundryManagement.reject(request.id), { admin_comment: rejectReason });
    onReject();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rechazar Solicitud</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Motivo de rechazo" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleReject} color="error">Rechazar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectLaundryModal;
