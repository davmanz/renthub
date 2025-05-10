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
  refreshBuildings: () => void;
}

const CreateBuildingModal = ({ open, onClose, refreshBuildings }: Props) => {
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isFormDirty = buildingName.trim() !== "" || address.trim() !== "";

  const handleClose = () => {
    if (isFormDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setBuildingName("");
    setAddress("");
    setShowConfirmClose(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!buildingName.trim() || !address.trim()) {
      setSnackbar({ open: true, message: "Todos los campos son obligatorios", severity: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(endpoints.siteManagement.building, {
        name: buildingName,
        address: address,
      });

      if (response.status === 201) {
        refreshBuildings();
        setSnackbar({ open: true, message: "Edificio creado con éxito", severity: "success" });
        setBuildingName("");
        setAddress("");
        onClose();
      } else {
        setSnackbar({ open: true, message: "Error inesperado del servidor", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error al crear el edificio", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setBuildingName("");
      setAddress("");
      setShowConfirmClose(false);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Agregar Edificio</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Edificio"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            margin="dense"
            required
          />
          <TextField
            fullWidth
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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

export default CreateBuildingModal;
