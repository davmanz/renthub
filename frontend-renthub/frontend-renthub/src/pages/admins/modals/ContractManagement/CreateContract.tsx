import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import SelectUserModal from "./SelectUserModal";
import SelectRoomModal from "./SelectRoomModal";
import { validateContractForm } from "../../../../components/utils/ContractValidation";


interface ContractFormData {
  user: string;
  room: string;
  start_date: string;
  end_date: string;
  rent_amount: string;
  deposit_amount: string;
  includes_wifi: string;
  wifi_cost: string;
}

interface CreateContractProps {
  open: boolean;
  onClose: () => void;
  onContractSaved: () => void;
  contractToEdit?: ContractFormData;
}

const CreateContract = ({ open, onClose, onContractSaved, contractToEdit }: CreateContractProps) => {
  const [formData, setFormData] = useState<ContractFormData>({
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
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

  const handleUserSelect = (user: any) => {
    setFormData(prev => ({ ...prev, user: user.id }));
    setSelectedUser(user);
    setUserModalOpen(false);
  };

  const handleRoomSelect = (room: any) => {
    setFormData(prev => ({ ...prev, room: room.id }));
    setSelectedRoom(room);
    setRoomModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value as string }));
  };

  const validateForm = () => {
    const validationErrors = validateContractForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (contractToEdit) {
        await api.put(endpoints.contractManagement.contracts, formData);
      } else {
        await api.post(endpoints.contractManagement.contracts, formData);
      }
      onContractSaved();
      onClose();
    } catch (err) {
      console.error("Error al guardar contrato", err);
      setErrorMessage("Error al guardar el contrato. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{contractToEdit ? "Editar Contrato" : "Crear Contrato"}</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Button fullWidth variant="outlined" onClick={() => setUserModalOpen(true)}>
          Seleccionar Usuario
        </Button>
        <TextField
          fullWidth
          label="Usuario"
          value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : formData.user}
          disabled
          error={!!errors.user}
          helperText={errors.user}
          margin="dense"
        />

        <Button fullWidth variant="outlined" onClick={() => setRoomModalOpen(true)}>
          Seleccionar Habitación
        </Button>
        <TextField
          fullWidth
          label="Habitación"
          value={selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_number}` : formData.room}
          disabled
          error={!!errors.room}
          helperText={errors.room}
          margin="dense"
        />

        <TextField
          fullWidth
          label="Fecha de Inicio"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          margin="dense"
          error={!!errors.start_date}
          helperText={errors.start_date}
          slotProps={
            {
              inputLabel: { shrink: true },
              input: { placeholder: "aaaa-mm-dd" },
            }
          }
        />
        <TextField
          fullWidth
          label="Fecha de Fin"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          margin="dense"
          error={!!errors.end_date}
          helperText={errors.end_date}
          slotProps={
            {
              inputLabel: { shrink: true },
              input: { placeholder: "aaaa-mm-dd" },
            }
          }
        />

        <TextField
          fullWidth
          label="Monto de Renta"
          name="rent_amount"
          value={formData.rent_amount}
          onChange={handleChange}
          margin="dense"
          error={!!errors.rent_amount}
          helperText={errors.rent_amount}
        />
        <TextField
          fullWidth
          label="Depósito"
          name="deposit_amount"
          value={formData.deposit_amount}
          onChange={handleChange}
          margin="dense"
          error={!!errors.deposit_amount}
          helperText={errors.deposit_amount}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Incluye WiFi</InputLabel>
          <Select name="includes_wifi" value={formData.includes_wifi} onChange={handleChange}>
            <MenuItem value="true">Sí</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Precio WiFi"
          name="wifi_cost"
          value={formData.wifi_cost}
          onChange={handleChange}
          disabled={formData.includes_wifi === "false"}
          margin="dense"
          error={!!errors.wifi_cost}
          helperText={errors.wifi_cost}
        />
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
