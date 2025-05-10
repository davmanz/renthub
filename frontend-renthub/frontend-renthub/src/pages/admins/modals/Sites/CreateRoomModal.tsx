import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

interface Props {
  open: boolean;
  onClose: () => void;
  building: { id: string; name: string };
  refreshRooms: () => void;
}

const CreateRoomModal = ({ open, onClose, building, refreshRooms }: Props) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isFormDirty = roomNumber.trim() !== "";

  const handleClose = () => {
    if (isFormDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setRoomNumber("");
    setShowConfirmClose(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!roomNumber.trim()) {
      setSnackbar({ open: true, message: "El número de habitación es obligatorio", severity: "error" });
      return;
    }
  
    if (!/^\d+$/.test(roomNumber.trim())) {
      setSnackbar({ open: true, message: "El número de habitación debe ser numérico", severity: "error" });
      return;
    }
    if (roomNumber.length > 3) {
      setSnackbar({ open: true, message: "El número de habitación no puede exceder los 3 dígitos", severity: "error" });
      return;
    }
  
    setLoading(true);
    try {
      const response = await api.post(endpoints.siteManagement.rooms, {
        room_number: roomNumber,
        building: building.id,
      });
  
      if (response.status === 201) {
        refreshRooms();
        setSnackbar({ open: true, message: "Habitación creada con éxito", severity: "success" });
        setRoomNumber("");
        onClose();
      } else {
        setSnackbar({ open: true, message: "Error inesperado al crear la habitación", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error al crear la habitación", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setRoomNumber("");
      setShowConfirmClose(false);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Habitación a {building ? building.name : "..."}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Número de Habitación"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            margin="dense"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de cierre */}
      <Dialog open={showConfirmClose} onClose={() => setShowConfirmClose(false)}>
        <DialogTitle>¿Deseas cerrar?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tienes cambios no guardados. ¿Estás seguro que deseas cerrar este formulario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmClose(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmClose} color="error">
            Cerrar sin guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateRoomModal;
