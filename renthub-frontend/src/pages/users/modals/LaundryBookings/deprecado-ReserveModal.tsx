import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, CircularProgress, Alert, Tooltip, Box, Typography
} from "@mui/material";
import { validateImageFile } from "../../../../components/utils/ValidateImageFile";

interface LaundryModalProps {
  open: boolean;
  handleClose: () => void;
  onSuccess: () => Promise<void>;
}

const LaundryModal = ({ open, handleClose, onSuccess }: LaundryModalProps) => {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [voucher, setVoucher] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userComment, setUserComment] = useState("");


  useEffect(() => {
    if (!open) {
      setDate("");
      setTimeSlot("");
      setVoucher(null);
      setError("");
      setSuccess("");
      setShowConfirmDialog(false);
  
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // ✅ libera memoria
        setPreviewUrl(null);
      }
    }
  }, [open]);
  
  const handleSubmit = () => {
    if (!date || !timeSlot || !voucher) {
      setError("Debes seleccionar una fecha, un horario y subir un comprobante.");
      return;
    }
    setError("");
    setShowConfirmDialog(true); // Mostrar modal de confirmación
  };

  const submitReservation = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Validar el archivo antes de enviarlo
    const errorMsg = validateImageFile(voucher!);
    if (errorMsg) {
      setError(errorMsg);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("date", date);
    formData.append("time_slot", timeSlot);
    formData.append("voucher_image", voucher!);
    formData.append("user_comment", userComment);

    try {
      const response = await api.post(endpoints.laundryManagement.create, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Reserva creada con éxito 🎉");
        onSuccess(); // ✅ recargar lista de reservas
        setSuccess("Reserva creada con éxito. Espera la confirmación.");
        setTimeout(() => {
          setSuccess("");
          handleClose();
        }, 200);
      } else {
        setError("Error al enviar la reserva. Verifica los datos.");
      }
    } catch (error: any) {
      if (error.response) {
        setError(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        setError("Hubo un problema al enviar la reserva.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Gestionar Reserva de Lavandería</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Fecha"
            type="date"
            fullWidth
            sx={{ mt: 2 }}
            value={date}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                placeholder: "aaaa-mm-dd",
                inputProps: { min: new Date().toISOString().split("T")[0] },
              },
            }}
            onChange={(e) => setDate(e.target.value)}
          />

          <TextField
            label="Horario"
            select
            fullWidth
            sx={{ mt: 2 }}
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            {[...Array(17)].map((_, i) => {
              const hour = (i + 6).toString().padStart(2, "0") + ":00";
              const nextHour = (i + 7).toString().padStart(2, "0") + ":00";
              return (
                <MenuItem key={i} value={`${hour}-${nextHour}`}>
                  {hour} - {nextHour}
                </MenuItem>
              );
            })}
          </TextField>

          <Tooltip title="Formatos aceptados: JPG, JPEG, PNG, GIF. Tamaño máximo: 5MB">
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Subir Comprobante de Pago
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const errorMsg = validateImageFile(file);
                    if (errorMsg) {
                      setError(errorMsg);
                      setVoucher(null);
                      setPreviewUrl(null);
                      return;
                    }
                    setError("");
                    setVoucher(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </Button>
          </Tooltip>

          <TextField
            label="Comentario sobre el pago (opcional)"
            fullWidth
            multiline
            rows={3}
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            sx={{ mt: 2 }}
          />

          {voucher && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Archivo seleccionado: {voucher.name}
            </Alert>
          )}

          {previewUrl && (
            <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Vista previa del comprobante:
            </Typography>
            <img
              src={previewUrl}
              alt="Vista previa comprobante"
              style={{
                width: "100%",
                maxHeight: 250,
                borderRadius: 8,
                objectFit: "contain",}}
            />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Reservar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirmar Reserva</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            ¿Confirmas la reserva para el día <strong>{date}</strong> en el horario <strong>{timeSlot}</strong>?
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
              submitReservation();
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LaundryModal;
