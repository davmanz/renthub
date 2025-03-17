import { useState } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

interface LaundryModalProps {
  open: boolean;
  handleClose: () => void;
}

const LaundryModal = ({ open, handleClose }: LaundryModalProps) => {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [voucher, setVoucher] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!date || !timeSlot || !voucher) {
      setError("Debes seleccionar una fecha, un horario y subir un comprobante.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("date", date);
    formData.append("time_slot", timeSlot);
    formData.append("voucher_image", voucher); // ✅ Asegurar que el archivo se adjunta correctamente

    try {
      const response = await api.post(endpoints.laundryManagement.create, formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "multipart/form-data", // ✅ Asegurar que el servidor lo procese correctamente
        },
      });

      if (response.status === 201) {
        setSuccess("Reserva creada con éxito. Espera la confirmación.");
        setTimeout(() => {
          setSuccess("");
          handleClose();
        }, 2000);
      } else {
        console.log("Respuesta del backend:", response.data);
        setError("Error al enviar la reserva. Verifica los datos.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Error de la API:", error.response.data);
        setError(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        setError("Hubo un problema al enviar la reserva.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {[...Array(24)].map((_, i) => {
            const hour = i.toString().padStart(2, "0") + ":00";
            const nextHour = (i + 1).toString().padStart(2, "0") + ":00";
            return (
              <MenuItem key={i} value={`${hour}-${nextHour}`}>
                {hour} - {nextHour}
              </MenuItem>
            );
          })}
        </TextField>

        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Subir Comprobante de Pago
          <input
            type="file"
            hidden
            accept="image/*" // ✅ Solo permite imágenes
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setVoucher(e.target.files[0]); // ✅ Asegura que el archivo sea válido
              }
            }}
          />
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Reservar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LaundryModal;
