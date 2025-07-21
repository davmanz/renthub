import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  LinearProgress,
  Skeleton,
  Alert,
  Chip,
  Tooltip,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Description,
  Numbers,
  Edit,
  Save,
  Cancel,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../../api/api';
import endpoints from '../../../api/endpoints';
import { UserInterface, DocumentType } from '../../../types/types';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileDetailsFormProps {
  user: UserInterface;
}

interface FormErrors {
  [key: string]: string;
}

const ProfileDetailsForm = ({ user }: ProfileDetailsFormProps) => {
  const { updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    document_number: '',
    document_type_id: '',
    phone_number: '',
  });
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState(formData);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const isSuperadmin = user.role === 'superadmin';

  // Verificar si hay cambios sin guardar
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  useEffect(() => {
    const initializeForm = async () => {
      if (user) {
        const userData = {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          document_number: user.document_number || '',
          document_type_id: user.document_type?.id || '',
          phone_number: user.phone_number || '',
        };
        setFormData(userData);
        setOriginalData(userData);
      }

      if (isSuperadmin) {
        try {
          const res = await api.get(endpoints.userManagement.documentTypes);
          setDocumentTypes(res.data);
        } catch {
          enqueueSnackbar('Error al cargar tipos de documento.', { variant: 'error' });
        }
      }
      
      setInitialLoading(false);
    };

    initializeForm();
  }, [user, isSuperadmin, enqueueSnackbar]);

  // Validación en tiempo real
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Formato de email inválido' : '';
      case 'phone_number':
        const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
        return value && !phoneRegex.test(value) ? 'Formato de teléfono inválido' : '';
      case 'first_name':
      case 'last_name':
        return value.trim().length < 2 ? 'Mínimo 2 caracteres requeridos' : '';
      case 'document_number':
        return value.trim().length < 3 ? 'Número de documento inválido' : '';
      default:
        return '';
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    const stringValue = value as string;
    
    setFormData(prev => ({
      ...prev,
      [name]: stringValue,
    }));

    // Validar campo en tiempo real
    const error = validateField(name, stringValue);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'phone_number') return; // Campo opcional
      
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
      
      if (!value.trim() && key !== 'phone_number') {
        newErrors[key] = 'Campo requerido';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Por favor corrige los errores en el formulario', { variant: 'warning' });
      return;
    }

    setLoading(true);

    try {
      await api.patch(endpoints.auth.me, formData);
      await updateUser();
      setOriginalData(formData);
      enqueueSnackbar('✅ Perfil actualizado correctamente.', { variant: 'success' });
      navigate(0);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || '❌ Error al actualizar el perfil.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData(originalData);
    setErrors({});
    setShowConfirmDialog(false);
  };

  const renderField = (
    name: keyof typeof formData,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    required: boolean = true,
    helperText?: string
  ) => (
    <Grid item xs={12} sm={name === 'phone_number' ? 12 : 6}>
      <TextField
        fullWidth
        required={required}
        type={type}
        name={name}
        label={label}
        value={formData[name]}
        onChange={handleChange}
        variant="outlined"
        disabled={!isSuperadmin || loading}
        error={!!errors[name]}
        helperText={errors[name] || helperText}
        slotProps={{
          input: {
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                {icon}
              </Box>
            ),
            endAdornment: !errors[name] && formData[name] && (
              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
            ),
          }
        }}
      />
    </Grid>
  );

  if (initialLoading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con información del estado */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            Información del Perfil
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!isSuperadmin && (
              <Tooltip title="Solo los gerentes pueden editar perfiles">
                <Chip 
                  icon={<Info />} 
                  label="Solo lectura" 
                  color="info" 
                  variant="outlined" 
                  size="small" 
                />
              </Tooltip>
            )}
            {hasUnsavedChanges && (
              <Chip 
                icon={<Edit />} 
                label="Cambios pendientes" 
                color="warning" 
                size="small" 
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Alerta para usuarios no-admin */}
      {!isSuperadmin && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button size="small" variant="outlined">
              Solicitar cambio
            </Button>
          }
        >
          Tu perfil está en modo de solo lectura. Contacta a un administrador para realizar cambios.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Grid container spacing={3}>
          {renderField('first_name', 'Nombre', <Person />, 'text', true)}
          {renderField('last_name', 'Apellido', <Person />, 'text', true)}
          {renderField('email', 'Correo Electrónico', <Email />, 'email', true, 'Se usará para notificaciones importantes')}
          {renderField('phone_number', 'Teléfono', <Phone />, 'tel', false, 'Formato: +51 999 999 999')}

          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required 
              disabled={!isSuperadmin || loading}
              error={!!errors.document_type_id}
            >
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                name="document_type_id"
                value={formData.document_type_id}
                onChange={handleChange}
                label="Tipo de Documento"
                startAdornment={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <Description />
                  </Box>
                }
              >
                {documentTypes.map(doc => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.document_type_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.document_type_id}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {renderField('document_number', 'Número de Documento', <Numbers />, 'text', true)}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Botones de acción */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          {hasUnsavedChanges && (
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !isSuperadmin || !hasUnsavedChanges}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </form>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>¿Descartar cambios?</DialogTitle>
        <DialogContent>
          <Typography>
            Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Mantener cambios
          </Button>
          <Button onClick={resetForm} color="error" variant="outlined">
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileDetailsForm;