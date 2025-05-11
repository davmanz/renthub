import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { ImageUtil } from "../utils/ImageUtil";

const RejectReasonModal = ({
  open,
  onClose,
  adminComment,
  voucherImage,
}: {
  open: boolean;
  onClose: () => void;
  adminComment: string;
  voucherImage?: string;
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", color: "#d32f2f" }}>
        Motivo del Rechazo
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          {adminComment || "No se proporcionó un motivo."}
        </Typography>

        {voucherImage && (
          <img
            src={ImageUtil.buildUrl(voucherImage)}
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

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonModal;
