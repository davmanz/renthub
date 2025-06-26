import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import SelectUserModal from "./SelectUserModal";
import SelectRoomModal from "./SelectRoomModal";
import { validateContractForm } from "../../../../components/utils/ContractValidation";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { SelectChangeEvent } from "@mui/material/Select";
import dayjs from 'dayjs';
import 'dayjs/locale/es';

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

interface CreateContractModalProps {
  open: boolean;
  onClose: () => void;
  onContractSaved: () => void;
}

const CreateContractModal = ({ open, onClose, onContractSaved }: CreateContractModalProps) => {
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
    if (!open) return;

    // Reset form when modal opens
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
    setSelectedUser(null);
    setSelectedRoom(null);
    setErrors({});
    setErrorMessage("");
  }, [open]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
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
      await api.post(endpoints.contractManagement.contracts, formData);
      toast.success("Contrato creado con éxito");
      onContractSaved();
      onClose();
    } catch (err) {
      console.error("Error al crear contrato", err);
      setErrorMessage("Error al crear el contrato. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Check if there are unsaved changes
    const hasChanges = Object.values(formData).some(value => value !== "" && value !== "false");
    
    if (hasChanges) {
      if (window.confirm("Hay cambios sin guardar. ¿Desea cerrar de todos modos?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Crear Contrato</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <Button 
          fullWidth 
          variant="outlined" 
          onClick={() => setUserModalOpen(true)}
          sx={{ mb: 1 }}
        >
          Seleccionar Usuario
        </Button>
        <TextField
          fullWidth
          label="Usuario"
          value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ""}
          disabled
          error={!!errors.user}
          helperText={errors.user || "Seleccione un usuario"}
          margin="dense"
        />

        <Button 
          fullWidth 
          variant="outlined" 
          onClick={() => setRoomModalOpen(true)}
          sx={{ mb: 1, mt: 2 }}
        >
          Seleccionar Habitación
        </Button>
        <TextField
          fullWidth
          label="Habitación"
          value={selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_number}` : ""}
          disabled
          error={!!errors.room}
          helperText={errors.room || "Seleccione una habitación"}
          margin="dense"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Fecha de Inicio"
            value={formData.start_date ? dayjs(formData.start_date) : null}
            onChange={(newValue) => {
              setFormData(prev => ({
                ...prev,
                start_date: newValue ? newValue.format('YYYY-MM-DD') : ''
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "dense",
                error: !!errors.start_date,
                helperText: errors.start_date || "Fecha de inicio del contrato"
              }
            }}
          />

          <DatePicker
            label="Fecha de Fin"
            value={formData.end_date ? dayjs(formData.end_date) : null}
            onChange={(newValue) => {
              setFormData(prev => ({
                ...prev,
                end_date: newValue ? newValue.format('YYYY-MM-DD') : ''
              }));
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "dense",
                error: !!errors.end_date,
                helperText: errors.end_date || "Fecha de finalización del contrato"
              }
            }}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          label="Monto de Renta"
          name="rent_amount"
          value={formData.rent_amount}
          onChange={handleChange}
          margin="dense"
          error={!!errors.rent_amount}
          helperText={errors.rent_amount}
          type="number"
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
          type="number"
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Incluye WiFi</InputLabel>
          <Select 
            name="includes_wifi" 
            value={formData.includes_wifi} 
            onChange={handleChange}
            label="Incluye WiFi"
          >
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
          type="number"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Crear Contrato"}
        </Button>
      </DialogActions>

      <SelectUserModal 
        open={userModalOpen} 
        onClose={() => setUserModalOpen(false)} 
        onSelect={handleUserSelect} 
      />
      <SelectRoomModal 
        open={roomModalOpen} 
        onClose={() => setRoomModalOpen(false)} 
        onSelect={handleRoomSelect} 
      />
    </Dialog>
  );
};

export default CreateContractModal;