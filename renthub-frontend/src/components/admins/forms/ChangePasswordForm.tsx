import { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Fade,
  Collapse,
  Alert,
  Tooltip,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Cancel,
  Security,
  Info,
  LockReset,
  Shield,
  Warning
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../../api/api';
import endpoints from '../../../api/endpoints';

interface PasswordStrength {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
  percentage: number;
}

interface ValidationRule {
  test: (pwd: string) => boolean;
  text: string;
  icon: React.ReactNode;
  severity: 'low' | 'medium' | 'high';
}

const ChangePasswordForm = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_repeat: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    new_password_repeat: false,
  });
  const [showValidations, setShowValidations] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Validación mejorada de fortaleza de contraseña
  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    let bonusPoints = 0;

    // Criterios básicos
    if (password.length >= 8) score++;
    if (password.length >= 12) { score++; bonusPoints++; }
    if (password.length >= 16) bonusPoints++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Criterios avanzados
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) bonusPoints++;
    if (!/(.)\1{2,}/.test(password)) bonusPoints++; // No caracteres repetidos
    if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) bonusPoints++;

    const totalScore = score + bonusPoints;
    const percentage = Math.min((totalScore / 9) * 100, 100);

    if (totalScore <= 2) return { score: totalScore, label: 'Muy débil', color: 'error', percentage };
    if (totalScore <= 4) return { score: totalScore, label: 'Débil', color: 'warning', percentage };
    if (totalScore <= 6) return { score: totalScore, label: 'Buena', color: 'info', percentage };
    if (totalScore <= 7) return { score: totalScore, label: 'Fuerte', color: 'success', percentage };
    return { score: totalScore, label: 'Excelente', color: 'success', percentage };
  }, []);

  // Validaciones mejoradas con iconos y severidad
  const passwordValidations: ValidationRule[] = [
    { 
      test: (pwd: string) => pwd.length >= 8, 
      text: 'Al menos 8 caracteres', 
      icon: <Typography variant="caption">8+</Typography>,
      severity: 'high'
    },
    { 
      test: (pwd: string) => /[a-z]/.test(pwd), 
      text: 'Una letra minúscula (a-z)', 
      icon: <Typography variant="caption" sx={{ fontWeight: 'normal' }}>a</Typography>,
      severity: 'high'
    },
    { 
      test: (pwd: string) => /[A-Z]/.test(pwd), 
      text: 'Una letra mayúscula (A-Z)', 
      icon: <Typography variant="caption" sx={{ fontWeight: 'bold' }}>A</Typography>,
      severity: 'high'
    },
    { 
      test: (pwd: string) => /\d/.test(pwd), 
      text: 'Al menos un número (0-9)', 
      icon: <Typography variant="caption">1</Typography>,
      severity: 'medium'
    },
    { 
      test: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd), 
      text: 'Un carácter especial (!@#$%...)', 
      icon: <Typography variant="caption">@</Typography>,
      severity: 'medium'
    },
    { 
      test: (pwd: string) => pwd.length >= 12, 
      text: 'Al menos 12 caracteres (recomendado)', 
      icon: <Typography variant="caption">12+</Typography>,
      severity: 'low'
    },
  ];

  const passwordStrength = getPasswordStrength(formData.new_password);
  const passwordsMatch = formData.new_password === formData.new_password_repeat && formData.new_password_repeat !== '';
  const requiredValidations = passwordValidations.filter(v => v.severity === 'high');
  const requiredMet = requiredValidations.every(v => v.test(formData.new_password));

  useEffect(() => {
    if (formData.new_password.length > 0 && !showValidations) {
      setShowValidations(true);
    }
  }, [formData.new_password.length, showValidations]);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'new_password' && !passwordTouched) {
      setPasswordTouched(true);
    }
    if (name === 'new_password_repeat' && !confirmTouched) {
      setConfirmTouched(true);
    }
  };

  const isFormValid = () => {
    return (
      formData.old_password !== '' &&
      requiredMet &&
      passwordsMatch &&
      passwordStrength.score >= 3
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      enqueueSnackbar('Por favor, completa todos los campos correctamente.', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await api.post(endpoints.auth.changePassword, formData);
      enqueueSnackbar('🔒 ¡Contraseña actualizada con éxito! Por seguridad, se recomienda volver a iniciar sesión.', { 
        variant: 'success',
        autoHideDuration: 6000 
      });
      // Reset form
      setFormData({ old_password: '', new_password: '', new_password_repeat: '' });
      setShowPasswords({ old_password: false, new_password: false, new_password_repeat: false });
      setPasswordTouched(false);
      setConfirmTouched(false);
      setShowValidations(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Ocurrió un error al cambiar la contraseña.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    switch (passwordStrength.color) {
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'success': return theme.palette.success.main;
      default: return theme.palette.grey[300];
    }
  };

  return (
    <Card elevation={3} sx={{ position: 'relative', overflow: 'visible' }}>
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            borderRadius: '4px 4px 0 0'
          }} 
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        {/* Header mejorado */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Shield sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Cambiar Contraseña
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mantén tu cuenta segura con una contraseña fuerte
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Una contraseña fuerte protege tu información personal">
              <IconButton size="small">
                <Info color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Alerta de seguridad */}
        <Alert 
          severity="info" 
          icon={<Security />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Consejo de seguridad:</strong> Usa una combinación única de letras, números y símbolos. 
            Evita información personal como fechas de nacimiento o nombres.
          </Typography>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Contraseña Actual */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type={showPasswords.old_password ? 'text' : 'password'}
                name="old_password"
                label="Contraseña Actual"
                value={formData.old_password}
                onChange={handleChange}
                variant="outlined"
                helperText="Ingresa tu contraseña actual para verificar tu identidad"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockReset color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('old_password')}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPasswords.old_password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Nueva Contraseña" color="primary" variant="outlined" />
              </Divider>
            </Grid>

            {/* Nueva Contraseña */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type={showPasswords.new_password ? 'text' : 'password'}
                name="new_password"
                label="Nueva Contraseña"
                value={formData.new_password}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new_password')}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPasswords.new_password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Indicador de Fortaleza Mejorado */}
              <Fade in={passwordTouched && formData.new_password.length > 0}>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fortaleza de la contraseña:
                    </Typography>
                    <Chip 
                      size="small" 
                      label={passwordStrength.label} 
                      color={passwordStrength.color}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordStrength.percentage}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: alpha(getStrengthBarColor(), 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStrengthBarColor(),
                          borderRadius: 4,
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        right: 4, 
                        top: -2, 
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {Math.round(passwordStrength.percentage)}%
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Validaciones de Contraseña Mejoradas */}
            <Collapse in={showValidations}>
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1, fontSize: 18 }} />
                    Requisitos de seguridad:
                  </Typography>
                  <Grid container spacing={1}>
                    {passwordValidations.map((validation, index) => {
                      const isValid = validation.test(formData.new_password);
                      return (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              bgcolor: isValid ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                              border: isValid ? `1px solid ${alpha(theme.palette.success.main, 0.2)}` : 'none',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Box 
                              sx={{ 
                                minWidth: 24, 
                                height: 24, 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isValid ? 'success.main' : 'grey.300',
                                color: 'white',
                                mr: 1,
                                fontSize: '0.75rem'
                              }}
                            >
                              {isValid ? <CheckCircle sx={{ fontSize: 16 }} /> : validation.icon}
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: isValid ? 'success.main' : 'text.secondary',
                                fontWeight: isValid ? 600 : 400,
                                flex: 1
                              }}
                            >
                              {validation.text}
                            </Typography>
                            {validation.severity === 'low' && (
                              <Chip 
                                label="Opcional" 
                                size="small" 
                                variant="outlined" 
                                color="info"
                                sx={{ fontSize: '0.6rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            </Collapse>

            {/* Confirmar Nueva Contraseña */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type={showPasswords.new_password_repeat ? 'text' : 'password'}
                name="new_password_repeat"
                label="Confirmar Nueva Contraseña"
                value={formData.new_password_repeat}
                onChange={handleChange}
                variant="outlined"
                error={confirmTouched && formData.new_password_repeat !== '' && !passwordsMatch}
                helperText={
                  confirmTouched && formData.new_password_repeat !== '' && !passwordsMatch 
                    ? 'Las contraseñas no coinciden' 
                    : 'Repite la nueva contraseña para confirmar'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmTouched && formData.new_password_repeat !== '' && (
                        <Box sx={{ mr: 1 }}>
                          {passwordsMatch ? (
                            <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                          ) : (
                            <Cancel sx={{ fontSize: 20, color: 'error.main' }} />
                          )}
                        </Box>
                      )}
                      <IconButton
                        onClick={() => togglePasswordVisibility('new_password_repeat')}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPasswords.new_password_repeat ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Mensaje de confirmación */}
            <Fade in={passwordsMatch && formData.new_password_repeat !== ''}>
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="body2">
                    ¡Perfecto! Las contraseñas coinciden y cumplen con los requisitos de seguridad.
                  </Typography>
                </Alert>
              </Grid>
            </Fade>

            {/* Advertencia si la contraseña es débil */}
            <Fade in={passwordTouched && passwordStrength.score < 3 && formData.new_password.length > 0}>
              <Grid item xs={12}>
                <Alert severity="warning" icon={<Warning />}>
                  <Typography variant="body2">
                    Tu contraseña es demasiado débil. Considera agregar más caracteres y variedad para mayor seguridad.
                  </Typography>
                </Alert>
              </Grid>
            </Fade>

            {/* Botón de Envío Mejorado */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !isFormValid()}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Security />}
                >
                  {loading ? 'Actualizando Contraseña...' : 'Actualizar Contraseña'}
                </Button>
                
                {!isFormValid() && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 1, textAlign: 'center' }}
                  >
                    Completa todos los campos para continuar
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;