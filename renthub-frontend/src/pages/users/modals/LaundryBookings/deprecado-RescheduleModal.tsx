import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const RescheduleModal = ({ open, booking, fetchBookings, handleClose }: { open: boolean, booking: any, fetchBookings: () => void, handleClose: () => void }) => {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");

  useEffect(() => {
    if (booking) {
      setRescheduleDate(booking.counter_proposal_date || "");
      setRescheduleTimeSlot(booking.counter_proposal_time_slot || "");
    }
  }, [booking]);

  const handleReschedule = async () => {
    if (!booking || !rescheduleDate.trim() || !rescheduleTimeSlot.trim()) return;
    try {
      await api.post(endpoints.laundryManagement.counterProposal(booking.id), { counter_proposal_date: rescheduleDate, counter_proposal_time_slot: rescheduleTimeSlot });
      fetchBookings();
      handleClose();
    } catch (err) {
      console.error("Error al reprogramar la reserva.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Reprogramar Reserva</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Nueva Fecha" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} sx={{ mt: 2 }} />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Nuevo Horario</InputLabel>
          <Select value={rescheduleTimeSlot} onChange={(e) => setRescheduleTimeSlot(e.target.value)}>
            {[...Array(24)].map((_, i) => {
              const hour = i.toString().padStart(2, "0") + ":00";
              const nextHour = (i + 1).toString().padStart(2, "0") + ":00";
              return <MenuItem key={i} value={`${hour}-${nextHour}`}>{hour} - {nextHour}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleReschedule} color="warning">Reprogramar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleModal;