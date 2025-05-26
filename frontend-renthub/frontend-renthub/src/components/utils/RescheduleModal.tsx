import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Alert, CircularProgress,
} from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

interface RescheduleModalProps {
  open: boolean;
  booking: {
    id: number;
    counter_proposal_date?: string;
    counter_proposal_time_slot?: string;
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

  useEffect(() => {
    if (booking) {
      setRescheduleDate(booking.counter_proposal_date || "");
      setRescheduleTimeSlot(booking.counter_proposal_time_slot || "");
      setError("");
    }
  }, [booking]);

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
      await api.post(
        endpoints.laundryManagement.counterProposal(String(booking.id)),
        {
          counter_proposal_date: rescheduleDate,
          counter_proposal_time_slot: rescheduleTimeSlot,
        }
      );
      fetchBookings();
      handleClose();
    } catch {
      setError("Error al reprogramar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Reprogramar Reserva</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nueva Fecha"
          type="date"
          sx={{ mt: 2 }}
          value={rescheduleDate}
          onChange={(e) => setRescheduleDate(e.target.value)}
          error={!!rescheduleDate && !isDateValid(rescheduleDate)}
          helperText={
            !!rescheduleDate && !isDateValid(rescheduleDate)
              ? "La fecha debe ser igual o posterior a hoy"
              : ""
          }
          slotProps={
            {
              inputLabel: { shrink: true },
              input: { placeholder: "aaaa-mm-dd" },
            }
          }
        />

        <TextField
          fullWidth
          select
          label="Nuevo Horario"
          value={rescheduleTimeSlot}
          onChange={(e) => setRescheduleTimeSlot(e.target.value)}
          sx={{ mt: 2 }}
        >
          {TIME_SLOTS.map((slot, idx) => (
            <MenuItem key={idx} value={slot.value}>
              {slot.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleReschedule}
          color="warning"
          disabled={loading || !isDateValid(rescheduleDate)}
        >
          {loading ? <CircularProgress size={24} /> : "Reprogramar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleModal;
