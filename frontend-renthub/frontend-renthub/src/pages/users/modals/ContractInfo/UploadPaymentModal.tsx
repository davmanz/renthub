import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Alert, MenuItem, FormControl, InputLabel, Select, Stack, Typography } from "@mui/material";
import { CloudUpload, Cancel } from "@mui/icons-material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const UploadPaymentModal = ({ open, onClose, nextPaymentMonth }: { open: boolean; onClose: () => void; nextPaymentMonth: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [monthPaid, setMonthPaid] = useState(nextPaymentMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file || !monthPaid) {
      setError("Selecciona un mes de pago y sube el comprobante.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("receipt_image", file);
    formData.append("month_paid", monthPaid);
    formData.append("payment_type", "rent");

    try {
      const response = await api.post(endpoints.payments.rental, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        onClose();
      } else {
        setError("Hubo un problema con la carga del pago.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al subir el comprobante. Verifica el mes de pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2" }}>
        Subir Comprobante de Pago
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          {/* Selección del mes de pago */}
          <FormControl fullWidth>
            <InputLabel>Mes de Pago</InputLabel>
            <Select value={monthPaid} onChange={(e) => setMonthPaid(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => {
                const year = new Date().getFullYear();
                const month = (i + 1).toString().padStart(2, "0");
                return (
                  <MenuItem key={month} value={`${year}-${month}`}>
                    {`${year}-${month}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Input de archivo */}
          <Button variant="contained" component="label" startIcon={<CloudUpload />}>
            Seleccionar Comprobante
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          {/* Vista previa del comprobante */}
          {preview && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Vista previa del comprobante</Typography>
              <img src={preview} alt="Vista previa" style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 8 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} color="error" variant="outlined" startIcon={<Cancel />} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" startIcon={<CloudUpload />} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Subir Comprobante"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadPaymentModal;
