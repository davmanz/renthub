import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Snackbar, Alert, DialogContentText,
  CircularProgress, Tooltip
} from "@mui/material";
import { DomainAdd } from "@mui/icons-material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

// Función de validación centralizada
const validateRoomNumber = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed) return "El número de habitación es obligatorio";
  if (!/^\d+$/.test(trimmed)) return "No debe contener signos o letras";
  if (trimmed.length > 3) return "Máximo 3 dígitos";
  if (parseInt(trimmed, 10) <= 0) return "Debe ser mayor a 0";
  return null;
};

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

  const errorMessage = validateRoomNumber(roomNumber);
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
    if (errorMessage) {
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(endpoints.siteManagement.rooms, {
        room_number: parseInt(roomNumber.trim(), 10),
        building: building.id,
      });

      if (response.status === 201) {
        refreshRooms();
        setSnackbar({ open: true, message: "Habitación creada con éxito", severity: "success" });
        setRoomNumber("");
        onClose();

      }else {
        setSnackbar({ open: true, message: "Error inesperado al crear la habitación", severity: "error" });
      }
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Error al crear la habitación";

      setSnackbar({ open: true, message: backendMessage, severity: "error" });
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DomainAdd fontSize="large" />
          Agregar Habitación a {building?.name || "..."}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Número de Habitación"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            margin="dense"
            required
            error={!!errorMessage}
            helperText={errorMessage}
            slotProps={{
              input: {
                'aria-label': 'Número de habitación',
                inputProps: {
                  maxLength: 3
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && !errorMessage) {
                handleSubmit();
              }
            }}
            disabled={loading}
          />

          <Tooltip title="Limpiar campo" arrow>
            <Button
              onClick={() => setRoomNumber("")}
              variant="text"
              size="small"
              sx={{ mt: 1 }}
              disabled={loading || !roomNumber}
            >
              Limpiar
            </Button>
          </Tooltip>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !!errorMessage}>
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
