import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Alert, CircularProgress,
  Box, Typography
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

interface RescheduleModalProps {
  open: boolean;
  booking: {
    id: string;
    proposed_date?: string;
    proposed_time_slot?: string;
  };
  fetchBookings: () => void;
  handleClose: () => void;
}

const TIME_SLOTS = [...Array(24)].map((_, i) => {
  const hour = i.toString().padStart(2, "0") + ":00";
  const nextHour = (i + 1).toString().padStart(2, "0") + ":00";
  return { value: `${hour}-${nextHour}`, label: `${hour} - ${nextHour}` };
});

const isDateValid = (date: string) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

const RescheduleModal = ({
  open,
  booking,
  fetchBookings,
  handleClose,
}: RescheduleModalProps) => {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (booking) {
      setRescheduleDate(booking.proposed_date || "");
      setRescheduleTimeSlot(booking.proposed_time_slot || "");
      setError("");
    }
  }, [booking]);

  useEffect(() => {
    if (!open) {
        setRescheduleDate("");
        setRescheduleTimeSlot("");
        setError("");
        setSuccessMessage("");
        setLoading(false);
    }
}, [open]);

  const handleReschedule = async () => {
    if (!booking || !rescheduleDate.trim() || !rescheduleTimeSlot.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (!isDateValid(rescheduleDate)) {
      setError("La fecha debe ser igual o posterior a hoy.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.post(
        endpoints.laundryManagement.propose(booking.id),
        {
          proposed_date: rescheduleDate,
          proposed_time_slot: rescheduleTimeSlot,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Reserva reprogramada exitosamente");
        await fetchBookings();
        setTimeout(() => {
          handleClose();
          setSuccessMessage("");
        }, 1500);
      } else {
        setError("No se pudo completar la reprogramación. Por favor, intente nuevamente.");
      }
    } catch (error: Error | any) {
      console.error('Error en reprogramación:', error);
      setError(
        error.response?.data?.message || 
        "Error al reprogramar la reserva. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Reprogramar Reserva
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nueva Fecha"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            error={!!rescheduleDate && !isDateValid(rescheduleDate)}
            helperText={
              !!rescheduleDate && !isDateValid(rescheduleDate)
                ? "La fecha debe ser igual o posterior a hoy"
                : "Seleccione una fecha para la reprogramación"
            }
            slotProps={{
              input: {
                min: new Date().toISOString().split("T")[0]
              }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Nuevo Horario"
            value={rescheduleTimeSlot}
            onChange={(e) => setRescheduleTimeSlot(e.target.value)}
            helperText="Seleccione un horario disponible"
            error={!rescheduleTimeSlot}
          >
            {TIME_SLOTS.map((slot, idx) => (
              <MenuItem key={idx} value={slot.value}>
                {slot.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleReschedule}
          color="warning"
          variant="contained"
          disabled={loading || !isDateValid(rescheduleDate) || !rescheduleTimeSlot}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Procesando...
            </Box>
          ) : (
            "Reprogramar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleModal;
