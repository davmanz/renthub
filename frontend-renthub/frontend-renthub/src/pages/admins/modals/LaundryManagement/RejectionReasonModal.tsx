import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const RejectionReasonModal = ({ open, onClose, request }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Motivo de Rechazo</DialogTitle>
      <DialogContent>
        <Typography>
          {request?.admin_comment ? request.admin_comment : "Sin motivo especificado"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionReasonModal;
