import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Alert } from "@mui/material";
import api from "../../../api/api";
import endpoints from "../../../api/endpoints";

const UploadPaymentModal = ({ open, onClose, nextPayment }: { open: boolean; onClose: () => void; nextPayment: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile)); // Genera la vista previa
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Selecciona un comprobante antes de subirlo.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("receipt_image", file);
    formData.append("month_paid", nextPayment);

    try {
      await api.post(endpoints.payments.upload, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onClose();
    } catch (err) {
      setError("Hubo un error al subir el comprobante. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Subir Comprobante de Pago</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField type="file" fullWidth margin="dense" onChange={handleFileChange} />

        {/* Vista previa del comprobante */}
        {preview && (
          <img src={preview} alt="Vista previa" style={{ width: "100%", marginTop: 10, borderRadius: 5 }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Subir Comprobante"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadPaymentModal;
