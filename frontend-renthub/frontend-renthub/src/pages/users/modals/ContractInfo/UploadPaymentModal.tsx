import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { CloudUpload, Cancel } from "@mui/icons-material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { DateUtil } from "../../../../components/utils/DateUtil";
import { validateImageFile } from "../../../../components/utils/ValidateImageFile";
import { toast } from "react-toastify";

const UploadPaymentModal = ({
  open,
  onClose,
  nextPaymentMonth,
  paymentId,
}: {
  open: boolean;
  onClose: () => void;
  nextPaymentMonth: string | null;
  paymentId: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError("");
      setPreview(null);
      setShowConfirmDialog(false);
    }
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      const errorMsg = validateImageFile(selectedFile);
      if (errorMsg) {
        setError(errorMsg);
        setFile(null);
        setPreview(null);
        return;
      }
      setError("");
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = () => {
    if (!file || !paymentId) {
      setError("Debes subir un comprobante válido.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const submitPayment = async () => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("receipt_image", file!);

    try {
      const response = await api.patch(endpoints.payments.detailRent(paymentId), formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Comprobante subido con éxito 🎉");
        onClose();
      } else {
        setError("Hubo un problema con la carga del comprobante.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al subir el comprobante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2" }}>
          Subir Comprobante de Pago
        </DialogTitle>

        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Mes a pagar:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {nextPaymentMonth ? DateUtil.getMonthAndYear(nextPaymentMonth) : "No disponible"}
              </Typography>
            </Box>

            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Seleccionar Comprobante
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
              />
            </Button>

            {file && (
              <Alert severity="info">
                Archivo seleccionado: {file.name}
              </Alert>
            )}

            {preview && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Vista previa del comprobante
                </Typography>
                <img
                  src={preview}
                  alt="Vista previa"
                  style={{
                    width: "100%",
                    maxHeight: 250,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={onClose}
            color="error"
            variant="outlined"
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Subir Comprobante"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirmar Envío</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            ¿Confirmas subir el comprobante de pago para el mes <strong>{DateUtil.getMonthAndYear(nextPaymentMonth || "")}</strong>?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowConfirmDialog(false);
              submitPayment();
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadPaymentModal;
