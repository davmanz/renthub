import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
//import { ImageUtil } from "../utils/ImageUtil";

const ViewVoucherModal = ({
  open,
  onClose,
  voucherImage,
  userComment,
}: {
  open: boolean;
  onClose: () => void;
  voucherImage: string;
  userComment?: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Comprobante de Pago
      </DialogTitle>

      <DialogContent>
        {voucherImage ? (
          <img
            src={voucherImage}
            alt="Comprobante de pago"
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <Typography>No hay comprobante disponible.</Typography>
        )}

        {userComment && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Comentario del usuario:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {userComment}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVoucherModal;
