import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

const styles = {
  dialogTitle: {
    textAlign: "center" as const,
    fontWeight: "bold",
    color: "#d32f2f"
  },
  image: {
    width: "100%",
    maxHeight: 400,
    objectFit: "contain" as const,
    borderRadius: 8,
  },
  actions: {
    justifyContent: "center",
    pb: 2
  }
};

interface RejectReasonModalProps {
  open: boolean;
  onClose: () => void;
  adminComment: string;
  voucherImage?: string;
}

const RejectReasonModal = ({
  open,
  onClose,
  adminComment,
  voucherImage,
}: RejectReasonModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={styles.dialogTitle}>
        Motivo del Rechazo
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          {adminComment || "No se proporcionó un motivo."}
        </Typography>

        {voucherImage && (
          <>
            {isLoading && <CircularProgress />}
            <img
              src={voucherImage}
              alt="Comprobante rechazado"
              style={styles.image}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={styles.actions}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonModal;
