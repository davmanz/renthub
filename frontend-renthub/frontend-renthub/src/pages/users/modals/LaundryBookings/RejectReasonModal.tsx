import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const RejectReasonModal = ({ open, booking, handleClose }: { open: boolean, booking: any, handleClose: () => void }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Motivo del Rechazo</DialogTitle>
      <DialogContent>
        <Typography>{booking?.admin_comment || "No se proporcionó un motivo."}</Typography>
        {booking?.voucher_image && <img src={booking.voucher_image} alt="Comprobante" width="100%" />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonModal;
