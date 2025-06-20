import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Checkbox, FormControlLabel, Grid,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Tooltip, CircularProgress, Paper, List, ListItem, ListItemIcon, ListItemText,
  Alert
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import SelectUserModal from "./SelectUserModal";
import SelectRoomModal from "./SelectRoomModal";
import { Contract } from "../../../../types/types";

// CAMPOS EDITABLES
interface Field {
  name: keyof ContractFormData;
  label: string;
  type?: 'text' | 'date' | 'number' | 'select';
}

const fields: Field[] = [
  { name: "user", label: "Usuario", type: 'select' },
  { name: "room", label: "Habitación", type: 'select' },
  { name: "start_date", label: "Fecha de Inicio", type: 'date' },
  { name: "end_date", label: "Fecha de Fin", type: 'date' },
  { name: "rent_amount", label: "Monto de Renta", type: 'number' },
  { name: "deposit_amount", label: "Depósito", type: 'number' },
  { name: "includes_wifi", label: "Incluye WiFi", type: 'select' },
  { name: "wifi_cost", label: "Precio WiFi", type: 'number' }
];

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

interface EditContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
  onContractUpdated: () => void;
}

// Estado inicial
const initialFormState: ContractFormData = {
  user: '',
  room: '',
  start_date: '',
  end_date: '',
  rent_amount: '',
  deposit_amount: '',
  includes_wifi: 'false',
  wifi_cost: ''
};

// COMPONENTE DE ERROR
const ErrorMessage: React.FC<{ error?: string }> = ({ error }) =>
  error ? (
    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
      {error}
    </Typography>
  ) : null;

const EditContractModal: React.FC<EditContractModalProps> = ({ 
  open, 
  onClose, 
  contract, 
  onContractUpdated 
}) => {
  const [formData, setFormData] = useState<ContractFormData>(initialFormState);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!contract) return;

      const initState: Record<string, boolean> = {};
      fields.forEach(f => initState[f.name] = false);
      setEnabledFields(initState);
      
      setFormData({
        user: contract.user?.toString() || "",
        room: contract.room?.toString() || "",
        start_date: contract.start_date || "",
        end_date: contract.end_date || "",
        rent_amount: contract.rent_amount?.toString() || "",
        deposit_amount: contract.deposit_amount?.toString() || "",
        includes_wifi: contract.includes_wifi ? "true" : "false",
        wifi_cost: contract.wifi_cost?.toString() || ""
      });

      setIsLoading(false);
    };

    if (open) {
      setIsLoading(true);
      setErrors({});
      setErrorMessage("");
      init();
    }
  }, [contract, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string) => {
    setEnabledFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

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

  const getSummary = () => {
    const updates: string[] = [];
    fields.forEach(f => {
      if (!enabledFields[f.name]) return;
      
      let oldValue: any;
      let newValue: any;

      switch (f.name) {
        case 'user':
          oldValue = contract?.user_full_name || "Sin usuario";
          newValue = selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : formData.user;
          break;
        case 'room':
          oldValue = contract ? `${contract.building_name} - ${contract.room_number}` : "Sin habitación";
          newValue = selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_number}` : formData.room;
          break;
        case 'includes_wifi':
          oldValue = contract?.includes_wifi ? "Sí" : "No";
          newValue = formData.includes_wifi === "true" ? "Sí" : "No";
          break;
        default:
          oldValue = contract?.[f.name as keyof Contract] || "Sin valor";
          newValue = formData[f.name];
      }

      if (String(oldValue) !== String(newValue)) {
        updates.push(`Se cambiará el campo ${f.label} de "${oldValue}" a "${newValue}"`);
      }
    });
    return updates;
  };

  const changes = useMemo(() => getSummary(), [formData, enabledFields, selectedUser, selectedRoom]);

  const handleClose = () => {
    if (changes.length > 0) {
      if (window.confirm("Hay cambios sin guardar. ¿Desea cerrar de todos modos?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    const payload: Partial<ContractFormData> = {};
    
    fields.forEach(f => {
      if (enabledFields[f.name]) {
        payload[f.name] = formData[f.name];
      }
    });

    if (Object.keys(payload).length === 0) return;

    setSaving(true);
    setErrorMessage("");

    try {
      await api.patch(`${endpoints.contractManagement.contracts}${contract!.id}/`, payload);
      toast.success("Contrato actualizado con éxito");
      onContractUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar contrato", err);
      setErrorMessage("Error al actualizar el contrato. Por favor, inténtelo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: Field) => {
    const isEnabled = enabledFields[field.name];
    
    if (field.name === 'user') {
      return (
        <>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => setUserModalOpen(true)}
            disabled={!isEnabled}
            sx={{ mb: 1 }}
          >
            Seleccionar Usuario
          </Button>
          <TextField
            fullWidth
            label="Usuario"
            value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : contract?.user_full_name || ""}
            disabled
            margin="dense"
          />
        </>
      );
    }

    if (field.name === 'room') {
      return (
        <>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => setRoomModalOpen(true)}
            disabled={!isEnabled}
            sx={{ mb: 1 }}
          >
            Seleccionar Habitación
          </Button>
          <TextField
            fullWidth
            label="Habitación"
            value={selectedRoom ? `${selectedRoom.building_name} - ${selectedRoom.room_number}` : (contract ? `${contract.building_name} - ${contract.room_number}` : "")}
            disabled
            margin="dense"
          />
        </>
      );
    }

    if (field.name === 'includes_wifi') {
      return (
        <FormControl fullWidth margin="dense" disabled={!isEnabled}>
          <InputLabel>Incluye WiFi</InputLabel>
          <Select
            value={formData.includes_wifi}
            onChange={(e) => handleChange("includes_wifi", e.target.value)}
            label="Incluye WiFi"
          >
            <MenuItem value="true">Sí</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
      );
    }

    return (
      <>
        <TextField
          fullWidth
          label={field.label}
          type={field.type || 'text'}
          value={formData[field.name] || ""}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={!isEnabled || (field.name === 'wifi_cost' && formData.includes_wifi === 'false')}
          margin="dense"
          error={!!errors[field.name]}
          slotProps={field.type === 'date' ? {
            inputLabel: { shrink: true },
            input: { placeholder: "aaaa-mm-dd" },
          } : undefined}
        />
        <ErrorMessage error={errors[field.name]} />
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          timeout: 500,
        },
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: 10,
          }
        }
      }}
    >
      <DialogTitle>Editar Contrato</DialogTitle>
      {isLoading ? (
        <DialogContent sx={{ 
          textAlign: "center", 
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Cargando información del contrato...
          </Typography>
        </DialogContent>
      ) : (
        <DialogContent>
          {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
          
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                <Paper 
                  elevation={enabledFields[field.name] ? 3 : 0}
                  sx={{
                    p: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: enabledFields[field.name] ? 'background.paper' : 'background.default',
                    border: '1px solid',
                    borderColor: enabledFields[field.name] ? 'primary.main' : 'divider',
                  }}
                >
                  <Tooltip title={`Habilitar edición del campo ${field.label}`}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enabledFields[field.name] || false}
                          onChange={() => handleCheckboxChange(field.name)}
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography 
                          sx={{ 
                            fontWeight: enabledFields[field.name] ? 'bold' : 'normal',
                            color: enabledFields[field.name] ? 'primary.main' : 'text.primary',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {`Editar ${field.label}`}
                        </Typography>
                      }
                    />
                  </Tooltip>

                  {renderField(field)}
                </Paper>
              </Grid>
            ))}

            {changes.length > 0 && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    mt: 2,
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Resumen de cambios:
                  </Typography>
                  <List dense>
                    {changes.map((c, i) => (
                      <ListItem key={i}>
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={c} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={saving}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={changes.length === 0 || saving}
          sx={{ 
            borderRadius: 2,
            px: 3,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Guardando...
            </>
          ) : 'Guardar Cambios'}
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

export default EditContractModal;