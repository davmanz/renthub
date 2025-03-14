import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import SelectUserModal from "./SelectUserModal";
import SelectRoomModal from "./SelectRoomModal";

const CreateContract = ({ open, onClose, onContractSaved, contractToEdit }) => {
  console.log("Modal abierto:", open, "Contrato a editar:", contractToEdit); // 🔥 Depuración

  const [formData, setFormData] = useState({
    user: "",
    room: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    deposit_amount: "",
    includes_wifi: "false",
    wifi_cost: "",
  });

  const [loading, setLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  useEffect(() => {
    console.log("ContractToEdit actualizado:", contractToEdit); // 🔥 Depuración
    if (contractToEdit) {
      setFormData(contractToEdit);
    } else {
      setFormData({
        user: "",
        room: "",
        start_date: "",
        end_date: "",
        rent_amount: "",
        deposit_amount: "",
        includes_wifi: "false",
        wifi_cost: "",
      });
    }
  }, [contractToEdit, open]);

  const handleUserSelect = (userId) => {
    setFormData((prev) => ({ ...prev, user: userId }));
    setUserModalOpen(false);
  };

  const handleRoomSelect = (roomId) => {
    setFormData((prev) => ({ ...prev, room: roomId }));
    setRoomModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (contractToEdit) {
        await api.put(`${endpoints.contractManagement.contracts}/${contractToEdit.id}`, formData);
      } else {
        await api.post(endpoints.contractManagement.contracts, formData);
      }
      onContractSaved();
      onClose();
    } catch (err) {
      console.error("Error al guardar contrato", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{contractToEdit ? "Editar Contrato" : "Crear Contrato"}</DialogTitle>
      <DialogContent>
        <Button fullWidth variant="outlined" onClick={() => setUserModalOpen(true)}>
          Seleccionar Usuario
        </Button>
        <TextField fullWidth label="Usuario" value={formData.user} disabled margin="dense" />

        <Button fullWidth variant="outlined" onClick={() => setRoomModalOpen(true)}>
          Seleccionar Habitación
        </Button>
        <TextField fullWidth label="Habitación" value={formData.room} disabled margin="dense" />

        <TextField fullWidth label="Fecha de Inicio" type="date" name="start_date" value={formData.start_date} onChange={handleChange} margin="dense" required />
        <TextField fullWidth label="Fecha de Fin" type="date" name="end_date" value={formData.end_date} onChange={handleChange} margin="dense" required />

        <TextField fullWidth label="Monto de Renta" name="rent_amount" value={formData.rent_amount} onChange={handleChange} margin="dense" required />
        <TextField fullWidth label="Depósito" name="deposit_amount" value={formData.deposit_amount} onChange={handleChange} margin="dense" required />

        <FormControl fullWidth margin="dense">
          <InputLabel>Incluye WiFi</InputLabel>
          <Select name="includes_wifi" value={formData.includes_wifi} onChange={handleChange}>
            <MenuItem value="true">Sí</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="Precio WiFi" name="wifi_cost" value={formData.wifi_cost} onChange={handleChange} disabled={formData.includes_wifi === "false"} margin="dense" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : contractToEdit ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>

      <SelectUserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} onSelect={handleUserSelect} />
      <SelectRoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} onSelect={handleRoomSelect} />
    </Dialog>
  );
};

export default CreateContract;
