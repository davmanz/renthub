import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Select, FormControl, 
  InputLabel, Grid, Alert, CircularProgress
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import ReferenceModal from "./ReferenceModal";
import { UserFormData, ReferencePerson} from "../../../../types/types";
import { validateUserForm } from "../../../../components/utils/UsersValidation";

// Constantes
const REFERENCE_COUNTS = {
  NONE: "0",
  ONE: "1",
  TWO: "2"
} as const;

// Tipos
interface SelectChangeEvent {
  target: {
    name: string;
    value: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onUserSaved: () => void;
}

const CreateUser = ({ open, onClose, onUserSaved }: Props) => {
  const initialFormState: UserFormData = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    document_type_id: "",
    document_number: "",
    reference_1_id: "",
    reference_2_id: "",
    references_count: 0,
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [availableReferences, setAvailableReferences] = useState<ReferencePerson[]>([]);
  const [selectedReferenceField, setSelectedReferenceField] = useState<string | null>(null);
  const [openReferenceModal, setOpenReferenceModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [docTypes, refs] = await Promise.all([
          api.get(endpoints.userManagement.documentTypes),
          api.get(endpoints.userManagement.referencePerson),
        ]);
        setDocumentTypes(docTypes.data);
        setAvailableReferences(refs.data);
      } catch (err) {
        setErrors(prev => ({
          ...prev,
          general: "Error al cargar los datos iniciales"
        }));
      }
    };
    fetchInitialData();
  }, []);

  // CORRECCIÓN: Manejar cambios en el número de referencias
  useEffect(() => {
    const referencesCount = formData.references_count || 0;
    
    if (referencesCount < 1) {
      setFormData(prev => ({ ...prev, reference_1_id: "", reference_2_id: "" }));
      setErrors(prev => {
        const { reference_1_id, reference_2_id, ...rest } = prev;
        return rest;
      });
    } else if (referencesCount === 1) {
      setFormData(prev => ({ ...prev, reference_2_id: "" }));
      setErrors(prev => {
        const { reference_2_id, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.references_count]);

  // CORRECCIÓN: Manejar cambios en el select incluyendo conversión a número
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    
    // Convertir a número si es el campo references_count
    const processedValue = name === 'references_count' ? parseInt(value) || 0 : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    // Limpiar error del campo cuando cambia
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateUserForm(formData, false);
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        document_type_id: formData.document_type_id,
        document_number: formData.document_number,
        ...(formData.reference_1_id && { reference_1_id: formData.reference_1_id }),
        ...(formData.reference_2_id && { reference_2_id: formData.reference_2_id })
      };
      await api.post(endpoints.userManagement.user, submitData);
      setFormData(initialFormState);
      setErrors({});
      onUserSaved();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        const newErrors: Record<string, string> = {};
        
        // Manejar el error específico de documento único
        if (errorData.non_field_errors && 
            errorData.non_field_errors[0].includes("document_type_id, document_number must make a unique set")) {
          newErrors.document_number = "Esta combinación de tipo y número de documento ya existe";
        } else {
          // Manejar otros errores como antes
          Object.keys(errorData).forEach(key => {
            let errorMessage = '';
            const rawError = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];

            // Mapeo de mensajes de error
            if (rawError.includes('already exists')) {
              switch(key) {
                case 'email':
                  errorMessage = 'Este correo electrónico ya está registrado en el sistema';
                  break;
                case 'phone_number':
                  errorMessage = 'Este número de teléfono ya está registrado en el sistema';
                  break;
                default:
                  errorMessage = 'Este valor ya existe en el sistema';
              }
            } else {
              errorMessage = rawError; // Mantener el mensaje original para otros tipos de errores
            }

            newErrors[key] = errorMessage;
          });
        }

        setErrors(newErrors);
      } else if (err.response?.status === 503 && err.response?.data?.code === 'gmail_token_error') {
        setErrors({
          general: "El usuario se creó, pero no se pudo enviar el correo de verificación debido a un problema con el servicio de correo. Por favor, contacte al administrador del sistema."
        });
        setTimeout(() => {
          onUserSaved();
          onClose();
        }, 5000);
      } else {
        setErrors({
          general: "Error al crear el usuario. Por favor, intente nuevamente."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceSelection = useCallback((field: string) => {
    setSelectedReferenceField(field);
    setOpenReferenceModal(true);
  }, []);

  const handleReferenceAdded = useCallback((newRef: ReferencePerson) => {
    setAvailableReferences(prev => [...prev, newRef]);
  }, []);

  const selectReference = useCallback((id: string) => {
    if (selectedReferenceField) {
      const fieldName = `${selectedReferenceField}_id`;
      setFormData(prev => ({ ...prev, [fieldName]: id }));
      setOpenReferenceModal(false);
    }
  }, [selectedReferenceField]);

  const getReferenceLabel = useCallback((id: string) => {
    const ref = availableReferences.find(r => r.id === id);
    return ref ? `${ref.first_name} ${ref.last_name}` : "Referencia no encontrada";
  }, [availableReferences]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setSelectedReferenceField(null);
    setOpenReferenceModal(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth 
      aria-labelledby="user-dialog-title"
    >
      <DialogTitle id="user-dialog-title">
        Crear Usuario
      </DialogTitle>
      
      <DialogContent>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Campos personales */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Nombre"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Apellido"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                name="document_type_id"
                value={formData.document_type_id}
                onChange={handleChange}
                error={!!errors.document_type_id}
                disabled={loading}
              >
                {documentTypes.map((doc: any) => (
                  <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>
                ))}
              </Select>
              {errors.document_type_id && <Alert severity="error">{errors.document_type_id}</Alert>}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Número de Documento"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              error={!!errors.document_number}
              helperText={errors.document_number}
              disabled={loading}
            />
          </Grid>

          {/* Sección de referencias */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cantidad de Referencias</InputLabel>
              <Select
                name="references_count"
                value={(formData.references_count || 0).toString()}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value={REFERENCE_COUNTS.NONE}>Ninguna</MenuItem>
                <MenuItem value={REFERENCE_COUNTS.ONE}>1 Referencia</MenuItem>
                <MenuItem value={REFERENCE_COUNTS.TWO}>2 Referencias</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* CORRECCIÓN: Referencias dinámicas con condiciones más claras */}
          {(formData.references_count || 0) >= 1 && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleReferenceSelection("reference_1")}
                disabled={loading}
              >
                {formData.reference_1_id 
                  ? getReferenceLabel(formData.reference_1_id) 
                  : "Seleccionar Referencia 1"
                }
              </Button>
              {errors.reference_1_id && (
                <Alert severity="error">{errors.reference_1_id}</Alert>
              )}
            </Grid>
          )}

          {(formData.references_count || 0) >= 2 && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleReferenceSelection("reference_2")}
                disabled={loading}
              >
                {formData.reference_2_id 
                  ? getReferenceLabel(formData.reference_2_id) 
                  : "Seleccionar Referencia 2"
                }
              </Button>
              {errors.reference_2_id && (
                <Alert severity="error">{errors.reference_2_id}</Alert>
              )}
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
          aria-label="Cancelar"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
          aria-label="Crear usuario"
        >
          {loading ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>

      <ReferenceModal
        open={openReferenceModal}
        onClose={() => setOpenReferenceModal(false)}
        references={availableReferences}
        onSelect={selectReference}
        onReferenceAdded={handleReferenceAdded}
      />
    </Dialog>
  );
};

export default CreateUser;