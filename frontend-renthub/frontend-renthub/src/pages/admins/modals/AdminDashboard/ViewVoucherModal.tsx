import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const ViewVoucherModal = ({ open, onClose, request }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Comprobante de Pago</DialogTitle>
      <DialogContent>
        {request?.receipt_image ? (
          <img 
            src={request.receipt_image} 
            alt="Comprobante de pago" 
            style={{ width: "100%", borderRadius: 8 }} 
          />
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
