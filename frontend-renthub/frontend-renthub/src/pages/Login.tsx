import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  CardContent, TextField, Button, Typography,
  Alert, CircularProgress, IconButton, InputAdornment, Box,
  Fade, Slide, Paper, Divider
} from "@mui/material";
import { 
  Visibility, VisibilityOff, Login as LoginIcon, 
  Email, Lock, CheckCircle, Hotel
} from "@mui/icons-material";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { login, isLoading: contextLoading } = useContext(AuthContext)!;
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});
  const [isFormTouched, setIsFormTouched] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-focus en el primer campo al cargar
  const emailRef = useRef<HTMLInputElement>(null);

  const TITLE_LOGIN = import.meta.env.VITE_TITLE_LOGIN || "RentHub";
  const SUB_TITLE = import.meta.env.VITE_SUBTITLE_LOGIN || "Gestión de Alquileres";
  
  // Variables de entorno para validación de contraseña
  const PASSWORD_MIN_LENGTH = parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH || "4");
  const PASSWORD_MAX_LENGTH = parseInt(import.meta.env.VITE_PASSWORD_MAX_LENGTH || "20");
  const PASSWORD_MIN_LOWERCASE = parseInt(import.meta.env.VITE_PASSWORD_MIN_LOWERCASE || "0");
  const PASSWORD_MIN_UPPERCASE = parseInt(import.meta.env.VITE_PASSWORD_MIN_UPPERCASE || "0");
  const PASSWORD_MIN_NUMERIC = parseInt(import.meta.env.VITE_PASSWORD_MIN_NUMERIC || "0");
  const PASSWORD_MIN_SPECIAL = parseInt(import.meta.env.VITE_PASSWORD_MIN_SPECIAL || "0");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      emailRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (field: keyof LoginFormData, value: string): string => {
    switch (field) {
      case 'email':
        if (!value) return "El correo electrónico es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Ingresa un correo electrónico válido";
        }
        return "";
      case 'password':
        if (!value) return "La contraseña es requerida";
        
        // Validar longitud mínima
        if (value.length < PASSWORD_MIN_LENGTH) {
          return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
        }
        
        // Validar longitud máxima
        if (value.length > PASSWORD_MAX_LENGTH) {
          return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`;
        }
        
        // Validar minúsculas requeridas
        if (PASSWORD_MIN_LOWERCASE > 0) {
          const lowercaseCount = (value.match(/[a-z]/g) || []).length;
          if (lowercaseCount < PASSWORD_MIN_LOWERCASE) {
            return `Debe contener al menos ${PASSWORD_MIN_LOWERCASE} letra(s) minúscula(s)`;
          }
        }
        
        // Validar mayúsculas requeridas
        if (PASSWORD_MIN_UPPERCASE > 0) {
          const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
          if (uppercaseCount < PASSWORD_MIN_UPPERCASE) {
            return `Debe contener al menos ${PASSWORD_MIN_UPPERCASE} letra(s) mayúscula(s)`;
          }
        }
        
        // Validar números requeridos
        if (PASSWORD_MIN_NUMERIC > 0) {
          const numericCount = (value.match(/[0-9]/g) || []).length;
          if (numericCount < PASSWORD_MIN_NUMERIC) {
            return `Debe contener al menos ${PASSWORD_MIN_NUMERIC} número(s)`;
          }
        }
        
        // Validar caracteres especiales requeridos
        if (PASSWORD_MIN_SPECIAL > 0) {
          const specialCount = (value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
          if (specialCount < PASSWORD_MIN_SPECIAL) {
            return `Debe contener al menos ${PASSWORD_MIN_SPECIAL} carácter(es) especial(es)`;
          }
        }
        
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof LoginFormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setIsFormTouched(true);

    // Validación en tiempo real solo después de que el usuario haya interactuado
    if (isFormTouched) {
      const fieldError = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
    
    // Limpiar error general
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsFormTouched(true);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      const userRole = result.user.role;
      
      setLoginSuccess(true);

      // Redireccionar después de animación
      setTimeout(() => {
        if (userRole === "admin" || userRole === "superadmin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/dashboard/user");
        }
      }, 1500);

    } catch (err: any) {
      let errorMessage = "Error al iniciar sesión";

      if (err.response?.status) {
        const { status, data } = err.response;
        const detail = data?.detail || data?.message || "";

        switch (status) {
          case 401:
            // Analizar el detalle para mensajes más específicos
            if (detail.includes("No active account found with the given credentials")) {
              errorMessage = "No se encontró una cuenta activa con estas credenciales. Verifica tu correo y contraseña.";
            } else if (detail.includes("No active account found")) {
              errorMessage = "No se encontró una cuenta activa con este correo.";
            } else if (detail.includes("Invalid credentials") || detail.includes("credentials")) {
              errorMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
            } else if (detail.includes("password")) {
              errorMessage = "Contraseña incorrecta.";
            } else if (detail.includes("email") || detail.includes("user")) {
              errorMessage = "Usuario no encontrado.";
            } else {
              errorMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
            }
            break;
            
          case 403:
            if (detail.includes("inactive") || detail.includes("disabled")) {
              errorMessage = "Tu cuenta está inactiva. Contacta al administrador.";
            } else if (detail.includes("suspended")) {
              errorMessage = "Tu cuenta ha sido suspendida.";
            } else {
              errorMessage = "Acceso denegado. Tu cuenta puede estar inactiva.";
            }
            break;
            
          case 422:
            // Priorizar detalles específicos de validación
            if (detail.includes("email")) {
              errorMessage = "Formato de correo electrónico inválido.";
            } else if (detail.includes("password")) {
              errorMessage = "La contraseña no cumple con los requisitos.";
            } else if (detail) {
              errorMessage = `Error de validación: ${detail}`;
            } else {
              errorMessage = "Datos inválidos. Verifica la información ingresada.";
            }
            break;
            
          case 429:
            // Extraer tiempo de espera si está disponible
            const retryAfter = err.response.headers?.['retry-after'];
            if (retryAfter) {
              errorMessage = `Demasiados intentos. Intenta en ${retryAfter} segundos.`;
            } else {
              errorMessage = "Demasiados intentos. Intenta más tarde.";
            }
            break;
            
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "Error del servidor. Intenta más tarde.";
            break;
            
          default:
            if (status >= 500) {
              errorMessage = "Error del servidor. Intenta más tarde.";
            } else if (status >= 400) {
              // Usar detalle del servidor si está disponible para otros errores 4xx
              errorMessage = detail 
                ? `Error: ${detail}` 
                : "Error al iniciar sesión. Verifica tus datos.";
            } else {
              errorMessage = "Error al iniciar sesión. Intenta nuevamente.";
            }
        }
      } else if (err.request) {
        errorMessage = "Sin conexión. Verifica tu conexión a internet.";
      } else if (err.message) {
        // Capturar errores de JavaScript/TypeScript
        console.error("Login error:", err.message);
        errorMessage = "Error inesperado. Intenta nuevamente.";
      } else {
        errorMessage = "Error inesperado. Intenta nuevamente.";
      }
      
      setError(errorMessage);
      
      // Shake animation para errores
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
      
    } finally {
      if (!loginSuccess) {
        setLoading(false);
      }
    }
  };

  const isFormDisabled = loading || contextLoading || loginSuccess;
  const hasErrors = Object.values(fieldErrors).some(error => error !== "");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, 
            rgba(25, 118, 210, 0.08) 0%, 
            rgba(156, 39, 176, 0.08) 25%,
            rgba(255, 87, 34, 0.08) 50%,
            rgba(76, 175, 80, 0.08) 75%,
            rgba(33, 150, 243, 0.08) 100%
          ),
          radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 87, 34, 0.1) 0%, transparent 50%)
        `,
        padding: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.02) 50%, transparent 52%)",
          pointerEvents: "none"
        }
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", sm: 420 },
            maxWidth: 420,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Header con gradiente */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              p: 4,
              textAlign: "center",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"10\" cy=\"90\" r=\"0.5\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
                opacity: 0.3
              }
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Hotel sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {TITLE_LOGIN}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {SUB_TITLE}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Alertas */}
            <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: "1.2rem"
                  }
                }}
                action={
                  <IconButton 
                    color="inherit" 
                    size="small" 
                    onClick={() => setError("")}
                  >
                    ✕
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Slide>

            <Slide direction="down" in={loginSuccess} mountOnEnter unmountOnExit>
              <Alert 
                severity="success"
                icon={<CheckCircle />}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)"
                }}
              >
                ¡Inicio de sesión exitoso! Redirigiendo...
              </Alert>
            </Slide>

            {/* Formulario */}
            <Box
              component="form"
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              sx={{
                "& .shake": {
                  animation: "shake 0.5s ease-in-out"
                },
                "@keyframes shake": {
                  "0%, 100%": { transform: "translateX(0)" },
                  "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
                  "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
                }
              }}
            >
              <TextField
                inputRef={emailRef}
                fullWidth
                label="Correo Electrónico"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleInputChange("email")}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                required
                autoComplete="email"
                disabled={isFormDisabled}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2"
                      }
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange("password")}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                required
                autoComplete="current-password"
                disabled={isFormDisabled}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)} 
                        edge="end"
                        disabled={isFormDisabled}
                        aria-label="alternar visibilidad de contraseña"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2"
                      }
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isFormDisabled || hasErrors}
                sx={{ 
                  py: 1.8,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  textTransform: "none",
                  background: loginSuccess 
                    ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                    : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  "&:hover": { 
                    background: loginSuccess 
                      ? "linear-gradient(135deg, #45a049 0%, #388e3c 100%)"
                      : "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)"
                  },
                  "&:disabled": {
                    background: loginSuccess 
                      ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                      : "#e0e0e0",
                    color: loginSuccess ? "#fff" : "#999",
                    boxShadow: "none"
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {isFormDisabled ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>
                      {loginSuccess ? "Redirigiendo..." : "Iniciando sesión..."}
                    </span>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LoginIcon />
                    <span>Iniciar Sesión</span>
                  </Box>
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3, opacity: 0.6 }} />

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="text"
                color="primary"
                sx={{ 
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { 
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    transform: "translateY(-1px)"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoginPage;