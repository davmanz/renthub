import { useState } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from "@mui/material";

const CreateRoomModal = ({ open, onClose, building, refreshRooms }) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const newRoom = {
        room_number: roomNumber,
        building: building.id,
      };

      const response = await api.post(endpoints.siteManagement.rooms, newRoom);

      if (response.status === 201) {
        refreshRooms();
        setRoomNumber("");
        onClose();
      } else {
        setError("⚠️ Error inesperado en la respuesta del servidor.");
      }
    } catch (error) {
      setError("❌ Error al crear la room. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Room a {building ? building.name : "..."}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          label="Número de Room"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoomModal;
