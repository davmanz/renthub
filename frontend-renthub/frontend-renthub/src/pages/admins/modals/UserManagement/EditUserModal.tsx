import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Checkbox, FormControlLabel, Grid,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Tooltip, CircularProgress, Paper, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { UserInterface, DocumentType, FormDataUserInterface } from "../../../../types/types";

// VALIDACIONES
const VALIDATION_RULES: Record<string, ValidationRule> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Correo electrónico inválido",
  },
  phone_number: {
    pattern: /^\+?[\d\s-]{8,}$/,
    message: "Número de teléfono inválido",
  },
};

// CAMPOS EDITABLES
interface Field {
  name: keyof UserInterface | 'document_type';
  label: string;
}

const fields: Field[] = [
  { name: "first_name", label: "Nombre" },
  { name: "last_name", label: "Apellido" },
  { name: "email", label: "Correo" },
  { name: "phone_number", label: "Teléfono" },
  { name: "document_type", label: "Tipo de Documento" },
  { name: "document_number", label: "Número de Documento" },
  { name: "role", label: "Rol" }
];

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserInterface | null;
  onUserUpdated: () => void;
}

interface ValidationRule {
  pattern: RegExp;
  message: string;
}

// Estado inicial
const initialFormState: FormDataUserInterface = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  document_type: '',
  document_number: '',
  role: ''
};

// COMPONENTE DE ERROR
const ErrorMessage: React.FC<{ error?: string }> = ({ error }) =>
  error ? (
    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
      {error}
    </Typography>
  ) : null;

// Componente principal con tipos
const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user, onUserUpdated }) => {

  const [formData, setFormData] = useState<FormDataUserInterface>(initialFormState);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {

      if (!user) return;

      const initState: Record<string, boolean> = {};

      fields.forEach(f => initState[f.name] = false);

      setEnabledFields(initState);
      
      setFormData({
        ...user,
        document_type: user.document_type?.id || ""
      });
      try {
        const res = await api.get(endpoints.userManagement.documentTypes);
        setDocumentTypes(res.data);
      } catch (err) {
      }
      setIsLoading(false);
    };
    if (open) {
      setIsLoading(true);
      init();
    }
  }, [user, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]) {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
      if (!rule.pattern.test(String(value))) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
      } else {
        setErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handleCheckboxChange = (field: string) => {
    setEnabledFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getSummary = () => {
    const updates: string[] = [];
    fields.forEach(f => {
      if (!enabledFields[f.name]) return;
      const oldValue = f.name === "document_type"
        ? user?.document_type?.name || "Sin tipo"
        : user?.[f.name as keyof UserInterface];
      const newValue = f.name === "document_type"
        ? documentTypes.find(dt => dt.id === formData[f.name])?.name || "Desconocido"
        : formData[f.name as keyof FormDataUserInterface];
      if (String(oldValue) !== String(newValue)) {
        updates.push(`Se cambiará el campo ${f.label} de "${oldValue}" a "${newValue}"`);
      }
    });
    return updates;
  };

  const changes = useMemo(() => getSummary(), [formData, enabledFields]);

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
    const payload: Partial<FormDataUserInterface> = {};
    fields.forEach(f => {
      if (enabledFields[f.name]) {
        if (f.name === 'document_type') {
          const value = formData[f.name];
          payload[f.name] = typeof value === 'string' ? parseInt(value, 10) : value;
        } else {
          payload[f.name as keyof FormDataUserInterface] = formData[f.name as keyof FormData];
        }
      }
    });

    if (Object.keys(payload).length === 0) return;

    setSaving(true);
    try {
      await api.patch(endpoints.userManagement.userId(user!.id), payload);
      onUserUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar usuario", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth
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
      <DialogTitle>Editar Usuario</DialogTitle>
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
            Cargando información del usuario...
          </Typography>
        </DialogContent>
      ) : (
        <DialogContent>
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

                  {field.name === "document_type" ? (
                    <FormControl fullWidth margin="dense" disabled={!enabledFields[field.name]}>
                      <InputLabel>Tipo de Documento</InputLabel>
                      <Select
                        value={formData.document_type || ""}
                        onChange={(e) => handleChange("document_type", e.target.value)}
                        label="Tipo de Documento"
                      >
                        {documentTypes.map(dt => (
                          <MenuItem key={dt.id} value={dt.id}>{dt.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : field.name === "role" ? (
                    <FormControl fullWidth margin="dense" disabled={!enabledFields[field.name]}>
                      <InputLabel>Rol</InputLabel>
                      <Select
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        label="Rol"
                      >
                        <MenuItem value="tenant">Tenant</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="superadmin">Superadmin</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label={field.label}
                        value={formData[field.name as keyof FormDataUserInterface] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        disabled={!enabledFields[field.name]}
                        margin="dense"
                        error={!!errors[field.name]}
                      />
                      <ErrorMessage error={errors[field.name]} />
                    </>
                  )}
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
    </Dialog>
  );
};

export default EditUserModal;
