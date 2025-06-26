// EditUserModal.tsx
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
import { UserInterface, DocumentType, UserFormData, UserRole } from "../../../../types/types";

// Tipo auxiliar: payload seguro solo con campos PATCH reales (sin profile_photo)
type UserPatchPayload = Omit<UserFormData, "profile_photo">;

const editableFields: (keyof UserPatchPayload)[] = [
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "document_type_id",
  "document_number",
  "role",
  "reference_1_id",
  "reference_2_id"
];

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

interface ValidationRule {
  pattern: RegExp;
  message: string;
}

// CAMPOS EDITABLES (coinciden con las keys de UserFormData)
interface Field {
  name: keyof UserPatchPayload;
  label: string;
}

const fields: Field[] = [
  { name: "first_name", label: "Nombre" },
  { name: "last_name", label: "Apellido" },
  { name: "email", label: "Correo" },
  { name: "phone_number", label: "Teléfono" },
  { name: "document_type_id", label: "Tipo de Documento" },
  { name: "document_number", label: "Número de Documento" },
  { name: "role", label: "Rol" }
];

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserInterface | null;
  onUserUpdated: () => void;
}

// Estado inicial
const initialFormState: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  document_type_id: '',
  document_number: '',
  role: "tenant",
  reference_1_id: null,
  reference_2_id: null,
  profile_photo: undefined // Esto no se envía, pero lo requiere UserFormData
};

const ErrorMessage: React.FC<{ error?: string }> = ({ error }) =>
  error ? (
    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
      {error}
    </Typography>
  ) : null;

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user, onUserUpdated }) => {

  const [formData, setFormData] = useState<UserFormData>(initialFormState);
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
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        document_type_id: user.document_type?.id ?? "",
        document_number: user.document_number,
        reference_1_id: user.reference_1?.id ?? null,
        reference_2_id: user.reference_2?.id ?? null,
        role: user.role,
        profile_photo: undefined // Siempre definido pero no se envía
      });

      try {
        const res = await api.get(endpoints.userManagement.documentTypes);
        setDocumentTypes(res.data);
      } catch {}
      setIsLoading(false);
    };
    if (open) {
      setIsLoading(true);
      init();
    }
  }, [user, open]);

  const handleChange = (field: keyof UserFormData, value: string | number) => {
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

  const handleCheckboxChange = (field: keyof UserPatchPayload) => {
    setEnabledFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Generar resumen de cambios
  const getSummary = () => {
    const updates: string[] = [];
    fields.forEach(f => {
      if (!enabledFields[f.name]) return;
      let oldValue: string | undefined = undefined;
      let newValue: string | undefined = undefined;

      if (f.name === "document_type_id") {
        oldValue = user?.document_type?.name ?? "Sin tipo";
        newValue = documentTypes.find(dt => dt.id === formData.document_type_id)?.name || "Desconocido";
      } else if (f.name === "role") {
        oldValue = user?.role || "";
        newValue = formData.role || "";
      } else {
        oldValue = user?.[f.name as keyof UserInterface]?.toString() || "";
        newValue = formData[f.name]?.toString() || "";
      }

      if (String(oldValue) !== String(newValue)) {
        updates.push(`Se cambiará el campo ${f.label} de "${oldValue}" a "${newValue}"`);
      }
    });
    return updates;
  };

  const changes = useMemo(() => getSummary(), [formData, enabledFields, user, documentTypes]);

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
    const payload: Partial<UserPatchPayload> = {};

    editableFields.forEach(field => {
      if (enabledFields[field]) {
        const value = formData[field];

        // Verificar que el valor no sea undefined
        if (value === undefined) return;

        if (field === "reference_1_id" || field === "reference_2_id") {
          payload[field] = value === null ? null : value as string;
        } else if (field === "role" && typeof value === "string") {
          payload[field] = value as UserRole;
        } else if (field === "document_type_id" && typeof value === "string") {
          payload[field] = value;
        } else if (typeof value === "string" && value.trim() !== "") {
          // Usar type assertion para los campos de string
          (payload as any)[field] = value;
        } else if (typeof value === "number") {
          (payload as any)[field] = value;
        }
      }
    });

    // Verificar si hay cambios reales
    if (Object.keys(payload).length === 0) {
      return;
    }

    setSaving(true);
    try {
      await api.patch(endpoints.userManagement.userId(user!.id), payload);
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
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

                  {field.name === "document_type_id" ? (
                    <FormControl fullWidth margin="dense" disabled={!enabledFields[field.name]}>
                      <InputLabel>Tipo de Documento</InputLabel>
                      <Select
                        value={formData.document_type_id}
                        onChange={(e) => handleChange("document_type_id", e.target.value)}
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
                        onChange={(e) => handleChange("role", e.target.value as UserRole)}
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
                        value={formData[field.name] || ""}
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
