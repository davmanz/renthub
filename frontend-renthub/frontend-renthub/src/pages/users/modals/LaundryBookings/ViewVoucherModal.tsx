import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const ViewVoucherModal = ({ open, onClose, request }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Comprobante de Pago</DialogTitle>
      <DialogContent>
        {request?.voucher_image ? (
          <img src={request.voucher_image} alt="Comprobante de pago" style={{ width: "100%" }} />
        ) : (
          <p>No hay comprobante disponible.</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVoucherModal;
