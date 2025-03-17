import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

const RescheduleLaundryModal = ({ open, onClose, request, onReschedule }) => {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");

  useEffect(() => {
    if (request) {
      setRescheduleDate(request.date);
      setRescheduleTimeSlot(request.time_slot);
    }
  }, [request]);

  const handleSubmit = async () => {
    if (!rescheduleDate.trim() || !rescheduleTimeSlot.trim()) return;
    await api.post(endpoints.laundryManagement.propose(request.id), {
      proposed_date: rescheduleDate,
      proposed_time_slot: rescheduleTimeSlot,
    });
    onReschedule();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Proponer Nueva Fecha y Hora</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Nueva Fecha" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
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
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} color="warning">Proponer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleLaundryModal;
