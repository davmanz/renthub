import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface RejectReasonModalProps {
  open: boolean;
  handleClose: () => void;
  booking: {
    admin_comment?: string;
    voucher_image?: string;
  };
}

const RejectReasonModal = ({ open, booking, handleClose }: RejectReasonModalProps) => {
  const getImageUrl = () => {
    const base = import.meta.env.VITE_API_URL || "";
    const path = booking.voucher_image || "";
    if (!path) return "";
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
        Motivo del Rechazo
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 2 }}>
          {booking?.admin_comment || "No se proporcionó un motivo."}
        </Typography>

        {booking?.voucher_image && (
          <img
            src={getImageUrl()}
            alt="Comprobante rechazado"
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonModal;
