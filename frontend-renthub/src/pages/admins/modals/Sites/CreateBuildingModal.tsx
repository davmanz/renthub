import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Snackbar, Alert, LinearProgress,
  DialogContentText, InputAdornment
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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
  const [errors, setErrors] = useState({ buildingName: "", address: "" });

  const isFormDirty = buildingName.trim() !== "" || address.trim() !== "";

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = { buildingName: "", address: "" };

    if (buildingName.trim().length < 3) {
      newErrors.buildingName = "El nombre debe tener al menos 3 caracteres";
    }

    if (address.trim().length < 5) {
      newErrors.address = "La dirección debe ser más específica";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const resetForm = () => {
    setBuildingName("");
    setAddress("");
    setErrors({ buildingName: "", address: "" });
    setShowConfirmClose(false);
  };

  const handleClose = () => {
    if (isFormDirty) {
      setShowConfirmClose(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post(endpoints.siteManagement.building, {
        name: buildingName.trim(),
        address: address.trim(),
      });

      if (response.status === 201) {
        setSnackbar({ open: true, message: "Edificio creado con éxito", severity: "success" });
        refreshBuildings();
        resetForm();
        onClose();
      } else if (response.status === 409) {
        setSnackbar({ open: true, message: "Ya existe un edificio con este nombre", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Error inesperado al crear el edificio", severity: "error" });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al crear el edificio";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        aria-labelledby="building-dialog-title"
        aria-describedby="building-dialog-description"
      >
        {loading && <LinearProgress />}
        <DialogTitle id="building-dialog-title">Agregar Edificio</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Nombre del Edificio"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            fullWidth
            margin="dense"
            required
            error={!!errors.buildingName}
            helperText={errors.buildingName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            margin="dense"
            required
            error={!!errors.address}
            helperText={errors.address}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de cierre */}
      <Dialog open={showConfirmClose} onClose={() => setShowConfirmClose(false)}>
        <DialogTitle>¿Deseas cerrar?</DialogTitle>
        <DialogContent>
          <DialogContentText id="building-dialog-description">
            Tienes cambios sin guardar. ¿Deseas salir sin guardar?
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
