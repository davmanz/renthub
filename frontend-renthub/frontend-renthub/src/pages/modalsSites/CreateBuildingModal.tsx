import { useState } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from "@mui/material";

const CreateBuildingModal = ({ open, onClose, refreshBuildings }) => {
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const newBuilding = {
        name: buildingName,
        address: address,
      };

      const response = await api.post(endpoints.createSites.building, newBuilding);

      if (response.status === 201) {
        refreshBuildings();
        alert("Building creado con éxito!");
        // Limpiar los campos del formulario
        setBuildingName("");
        setAddress("");
        onClose();
      } else {
        setError("⚠️ Error inesperado en la respuesta del servidor.");
      }
    } catch (error) {
      setError("❌ Error al crear el building. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Building</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          label="Nombre del Building"
          value={buildingName}
          onChange={(e) => setBuildingName(e.target.value)}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBuildingModal;
