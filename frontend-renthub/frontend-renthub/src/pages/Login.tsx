import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, IconButton, InputAdornment,
  Box, Snackbar
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Tipos para mejor tipado
interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const { login, isLoading: contextLoading } = useContext(AuthContext)!;
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success"
  });
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 4) {
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Solo limpiar error del campo específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Función optimizada para limpiar solo los campos del formulario
  const clearFormFields = () => {
    setFormData({
      email: "",
      password: ""
    });
    setShowPassword(false);
  };

  // Función para limpiar errores manualmente
  const clearErrors = () => {
    setErrors({});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    // Limpiar errores previos al iniciar nuevo intento
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      const userRole = result.user.role;
      
      // Marcar como exitoso
      setLoginSuccess(true);
      
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: "¡Inicio de sesión exitoso! Redirigiendo...",
        severity: "success"
      });

      // Redireccionar después de un breve delay
      setTimeout(() => {
        if (userRole === "admin" || userRole === "superadmin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/dashboard/user");
        }
      }, 1500);

    } catch (err: any) {
      
      let errorMessage = "Error al iniciar sesión";
      const newErrors: FormErrors = {};
      let shouldClearFields = false;
      let shouldShowSnackbar = false;

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            // Para errores 400, limpiar campos y mostrar errores específicos
            shouldClearFields = true;
            
            // Manejar errores de validación de campos específicos
            if (data?.email) {
              newErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
            }
            if (data?.password) {
              newErrors.password = Array.isArray(data.password) ? data.password[0] : data.password;
            }
            if (data?.non_field_errors) {
              newErrors.general = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
            }
            
            // Si no hay errores específicos de campos, mostrar error general
            if (!newErrors.email && !newErrors.password && !newErrors.general) {
              if (data?.detail) {
                errorMessage = data.detail;
              } else if (data?.message) {
                errorMessage = data.message;
              } else {
                errorMessage = "Datos de entrada inválidos. Verifica que todos los campos estén completos.";
              }
              newErrors.general = errorMessage;
            }
            break;
            
          case 401:
            // Para errores 401 (credenciales incorrectas), limpiar solo campos
            shouldClearFields = true;
            
            if (data?.detail) {
              errorMessage = data.detail;
            } else if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
            }
            newErrors.general = errorMessage;
            break;
            
          case 403:
            // Usuario bloqueado/sin permisos - mantener campos, solo mostrar error
            shouldClearFields = false;
            errorMessage = "Tu cuenta está bloqueada o no tiene permisos para acceder al sistema.";
            newErrors.general = errorMessage;
            break;
            
          case 422:
            // Errores de validación - limpiar campos
            shouldClearFields = true;
            
            if (data?.detail && Array.isArray(data.detail)) {
              data.detail.forEach((error: any) => {
                if (error.loc && error.loc.includes('email')) {
                  newErrors.email = error.msg;
                } else if (error.loc && error.loc.includes('password')) {
                  newErrors.password = error.msg;
                } else {
                  newErrors.general = error.msg;
                }
              });
            } else {
              errorMessage = data?.detail || "Error de validación de datos.";
              newErrors.general = errorMessage;
            }
            break;
            
          case 429:
            // Demasiados intentos - no limpiar campos
            shouldClearFields = false;
            errorMessage = "Demasiados intentos de login. Intenta más tarde.";
            newErrors.general = errorMessage;
            shouldShowSnackbar = true;
            break;
            
          case 500:
          case 502:
          case 503:
          case 504:
            // Errores del servidor - no limpiar campos
            shouldClearFields = false;
            errorMessage = "Error interno del servidor. Intenta más tarde.";
            newErrors.general = errorMessage;
            shouldShowSnackbar = true;
            break;
            
          default:
            shouldClearFields = true;
            errorMessage = data?.detail || data?.message || `Error ${status}: ${err.response.statusText}`;
            newErrors.general = errorMessage;
        }
      } else if (err.request) {
        // Error de red - no limpiar campos
        shouldClearFields = false;
        errorMessage = "Sin conexión al servidor. Verifica tu conexión a internet.";
        newErrors.general = errorMessage;
        shouldShowSnackbar = true;
      } else {
        // Error inesperado - limpiar campos
        shouldClearFields = true;
        errorMessage = err.message || "Error inesperado";
        newErrors.general = errorMessage;
      }
      
      console.log("Errores procesados:", newErrors);
      console.log("¿Limpiar campos?", shouldClearFields);
      
      // Establecer los errores SIEMPRE
      setErrors(newErrors);
      
      // Limpiar campos solo si es necesario
      if (shouldClearFields) {
        clearFormFields();
      }
      
      // Mostrar snackbar solo para errores críticos (servidor, red, límite de intentos)
      if (shouldShowSnackbar && newErrors.general) {
        setSnackbar({
          open: true,
          message: newErrors.general,
          severity: "error"
        });
      }
      
    } finally {
      // Solo detener el loading si no fue exitoso
      if (!loginSuccess) {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isFormDisabled = loading || contextLoading || loginSuccess;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%)",
        padding: 2
      }}
    >
      <Card sx={{ 
        width: { xs: "100%", sm: 400 },
        maxWidth: 400,
        padding: { xs: 2, sm: 4 }, 
        borderRadius: 3, 
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)", 
        background: "#fff",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)"
        }
      }}>
        <CardContent>
          <Typography 
            variant="h4" 
            align="center" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              color: "#1976d2",
              mb: 3
            }}
          >
            Iniciar Sesión
          </Typography>

          {errors.general && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                animation: "fadeIn 0.3s ease-in"
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={clearErrors}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  ✕
                </Button>
              }
            >
              {errors.general}
            </Alert>
          )}

          <form onSubmit={handleLogin} noValidate>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              required
              autoComplete="email"
              disabled={isFormDisabled}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleInputChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              required
              autoComplete="current-password"
              disabled={isFormDisabled}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      disabled={isFormDisabled}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isFormDisabled}
              sx={{ 
                mt: 1,
                py: 1.5, 
                fontWeight: "bold",
                fontSize: "1.1rem",
                borderRadius: 2,
                bgcolor: loginSuccess ? "#4caf50" : "#1976d2",
                "&:hover": { 
                  bgcolor: loginSuccess ? "#45a049" : "#115293",
                  transform: "translateY(-1px)"
                },
                "&:disabled": {
                  bgcolor: loginSuccess ? "#4caf50" : "#ccc"
                },
                transition: "all 0.2s ease-in-out"
              }}
            >
              {isFormDisabled ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>{loginSuccess ? "Redirigiendo..." : "Ingresando..."}</span>
                </Box>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>

          {/* Enlaces adicionales */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ cursor: "pointer", "&:hover": { color: "#1976d2" } }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Box>

          {/* Botón para limpiar errores (solo visible si hay errores) */}
          {(errors.general || errors.email || errors.password) && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button 
                variant="text" 
                size="small" 
                onClick={clearErrors}
                sx={{ color: "#666" }}
              >
                Limpiar errores
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "success" ? 3000 : 5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;