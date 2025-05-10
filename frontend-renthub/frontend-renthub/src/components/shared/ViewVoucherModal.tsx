import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { ImageUtil } from "../utils/ImageUtil"; // ✅ Importa la utilidad

const ViewVoucherModal = ({open,onClose,voucherImage,}: 
  {open: boolean;onClose: () => void; voucherImage: string;}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Comprobante de Pago
      </DialogTitle>

      <DialogContent>
        {voucherImage ? (
          <img
            src={ImageUtil.buildUrl(voucherImage)} // ✅ Usa la ruta absoluta
            alt="Comprobante de pago"
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <p>No hay comprobante disponible.</p>
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
