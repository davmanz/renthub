import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Alert, CircularProgress,
  Box, Typography
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { LaundryBooking,} from "../../../../types/types";

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface RescheduleModalProps {
  open: boolean;
  booking: LaundryBooking | null;
  fetchBookings: () => Promise<void>;
  onClose: () => void;
}

interface FormState {
  date: string;
  timeSlot: string;
}

const TIME_SLOTS = [...Array(24)].map((_, i) => {
  const hour = i.toString().padStart(2, "0") + ":00";
  const nextHour = (i + 1).toString().padStart(2, "0") + ":00";
  return { value: `${hour}-${nextHour}`, label: `${hour} - ${nextHour}` };
});

const isDateValid = (date: string): boolean => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !isNaN(selectedDate.getTime()) && selectedDate >= today;
};

const RescheduleModal = ({
  open,
  booking,
  fetchBookings,
  onClose,
}: RescheduleModalProps) => {
  const [formState, setFormState] = useState<FormState>({
    date: "",
    timeSlot: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (booking) {
      setFormState({
        date: booking.proposed_date || "",
        timeSlot: booking.proposed_time_slot || ""
      });
      setError("");
    }
  }, [booking]);

  useEffect(() => {
    if (!open) {
      setFormState({ date: "", timeSlot: "" });
      setError("");
      setSuccessMessage("");
      setLoading(false);
    }
  }, [open]);

  const handleTimeSlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, timeSlot: event.target.value }));
  };

  const validateForm = (): boolean => {
    if (!booking || !formState.date.trim() || !formState.timeSlot.trim()) {
      setError("Por favor completa todos los campos.");
      return false;
    }

    if (!isDateValid(formState.date)) {
      setError("La fecha debe ser igual o posterior a hoy.");
      return false;
    }

    return true;
  };

  const handleReschedule = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      if (!booking) {
        setError("No se encontró la reserva para reprogramar.");
        return;
      }

      const response = await api.post(
        endpoints.laundryManagement.propose(booking.id),
        {
          proposed_date: formState.date,
          proposed_time_slot: formState.timeSlot,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Reserva reprogramada exitosamente");
        await fetchBookings();
        setTimeout(() => {
          onClose();
          setSuccessMessage("");
        }, 2500);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error: unknown) {
      console.error('Error en reprogramación:', error);
      const apiError = error as ApiError;
      setError(
        apiError.response?.data?.message || 
        "Error al reprogramar la reserva. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
    };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              label="Nueva Fecha"
              value={formState.date ? dayjs(formState.date) : null}
              onChange={(newValue) => {
                setFormState(prev => ({
                  ...prev,
                  date: newValue ? newValue.format('YYYY-MM-DD') : ''
                }));
              }}
              minDate={dayjs()} // Evita seleccionar fechas pasadas
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!formState.date && !isDateValid(formState.date),
                  helperText: "Seleccione una fecha para la reprogramación"
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'background.paper',
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            select
            label="Nuevo Horario"
            value={formState.timeSlot}
            onChange={handleTimeSlotChange}
            helperText="Seleccione un horario disponible"
            error={!formState.timeSlot}
          >
            {TIME_SLOTS.map((slot) => (
              <MenuItem key={slot.value} value={slot.value}>
                {slot.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleReschedule}
          color="warning"
          variant="contained"
          disabled={loading || !isDateValid(formState.date) || !formState.timeSlot}
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
