import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  CardContent, Button, Typography,
  Alert, CircularProgress, IconButton, InputAdornment, Box,
  Fade, Slide, Paper, Divider, alpha,
  FormControl, InputLabel, OutlinedInput, FormHelperText
} from "@mui/material";
import { 
  Visibility, VisibilityOff, Login as LoginIcon, 
  Email, Lock, CheckCircle, Hotel, Security, TrendingUp
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

  const emailRef = useRef<HTMLInputElement>(null);

  const TITLE_LOGIN = import.meta.env.VITE_TITLE_LOGIN || "RentHub";
  const SUB_TITLE = import.meta.env.VITE_SUBTITLE_LOGIN || "Gestión de Alquileres";
  
  // Validación avanzada igual a la tuya...
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
        if (value.length < PASSWORD_MIN_LENGTH) {
          return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
        }
        if (value.length > PASSWORD_MAX_LENGTH) {
          return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`;
        }
        if (PASSWORD_MIN_LOWERCASE > 0) {
          const lowercaseCount = (value.match(/[a-z]/g) || []).length;
          if (lowercaseCount < PASSWORD_MIN_LOWERCASE) {
            return `Debe contener al menos ${PASSWORD_MIN_LOWERCASE} letra(s) minúscula(s)`;
          }
        }
        if (PASSWORD_MIN_UPPERCASE > 0) {
          const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
          if (uppercaseCount < PASSWORD_MIN_UPPERCASE) {
            return `Debe contener al menos ${PASSWORD_MIN_UPPERCASE} letra(s) mayúscula(s)`;
          }
        }
        if (PASSWORD_MIN_NUMERIC > 0) {
          const numericCount = (value.match(/[0-9]/g) || []).length;
          if (numericCount < PASSWORD_MIN_NUMERIC) {
            return `Debe contener al menos ${PASSWORD_MIN_NUMERIC} número(s)`;
          }
        }
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
    if (isFormTouched) {
      const fieldError = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
    if (error) setError("");
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
        errorMessage = "Error inesperado. Intenta nuevamente.";
      } else {
        errorMessage = "Error inesperado. Intenta nuevamente.";
      }
      setError(errorMessage);
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
    } finally {
      if (!loginSuccess) setLoading(false);
    }
  };

  const isFormDisabled = loading || contextLoading || loginSuccess;
  const hasErrors = Object.values(fieldErrors).some(error => error !== "");

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 30%, #2c1810 60%, #0f1419 100%)', padding: 2, position: "relative", overflow: 'hidden',
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(100, 181, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(129, 199, 132, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 183, 77, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: "none"
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(45deg, transparent 48%, rgba(100, 181, 246, 0.02) 50%, transparent 52%)",
        pointerEvents: "none"
      }
    }}>
      <Fade in timeout={800}>
        <Paper elevation={0} sx={{ width: { xs: "100%", sm: 460 }, maxWidth: 460, background: "rgba(15, 20, 25, 0.95)", backdropFilter: "blur(20px)", borderRadius: 4, border: "1px solid rgba(100, 181, 246, 0.3)", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(100, 181, 246, 0.1)", transition: 'all 0.3s ease', '&:hover': { boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 100px rgba(100, 181, 246, 0.15)", border: "1px solid rgba(100, 181, 246, 0.4)" } }}>
          {/* Header moderno */}
          <Box sx={{
            background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)',
            color: "white", p: 4, textAlign: "center", position: "relative", overflow: 'hidden', boxShadow: "0 8px 32px rgba(100, 181, 246, 0.3)",
            "&::before": {
              content: '""', position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: alpha('#64b5f6', 0.1), transform: 'rotate(45deg)', zIndex: 1
            }
          }}>
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha('#64b5f6', 0.15), border: '1px solid rgba(100, 181, 246, 0.3)', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.05)', boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)" } }}>
                  <Hotel sx={{ fontSize: 40, color: '#64b5f6' }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #64b5f6, #90caf9)', backgroundClip: 'text', color: 'transparent', mb: 1 }}>{TITLE_LOGIN}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, color: alpha('#90caf9', 0.8) }}>{SUB_TITLE}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, opacity: 0.7 }}>
                <Security sx={{ fontSize: 20, color: '#64b5f6' }} />
                <TrendingUp sx={{ fontSize: 20, color: '#81c784' }} />
                <Security sx={{ fontSize: 20, color: '#ffb74d' }} />
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: alpha('#f44336', 0.15), border: '1px solid rgba(244, 67, 54, 0.3)', color: '#ff6b6b', backdropFilter: 'blur(10px)', boxShadow: "0 8px 24px rgba(244, 67, 54, 0.2)", "& .MuiAlert-icon": { fontSize: "1.2rem", color: '#f44336' } }}
                action={
                  <IconButton color="inherit" size="small" onClick={() => setError("")}
                    sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)', bgcolor: alpha('#f44336', 0.2) } }}>
                    ✕
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Slide>
            <Slide direction="down" in={loginSuccess} mountOnEnter unmountOnExit>
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3, borderRadius: 3, bgcolor: alpha('#4caf50', 0.15), border: '1px solid rgba(76, 175, 80, 0.3)', color: '#4caf50', backdropFilter: 'blur(10px)', boxShadow: "0 8px 24px rgba(76, 175, 80, 0.2)", "& .MuiAlert-icon": { color: '#4caf50' } }}>
                ¡Inicio de sesión exitoso! Redirigiendo...
              </Alert>
            </Slide>

            {/* Login Form */}
            <Box component="form" ref={formRef} onSubmit={handleSubmit} noValidate sx={{
              "& .shake": { animation: "shake 0.5s ease-in-out" },
              "@keyframes shake": {
                "0%, 100%": { transform: "translateX(0)" },
                "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
                "20%, 40%, 60%, 80%": { transform: "translateX(4px)" }
              }
            }}>
              {/* EMAIL */}
              <FormControl fullWidth required margin="normal" variant="outlined" error={!!fieldErrors.email} disabled={isFormDisabled}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: alpha('#64b5f6', 0.05),
                    color: 'white',
                    transition: "all 0.3s ease",
                    "& fieldset": { borderColor: 'rgba(100, 181, 246, 0.2)' },
                    "&:hover": {
                      bgcolor: alpha('#64b5f6', 0.08),
                      "& fieldset": { borderColor: 'rgba(100, 181, 246, 0.4)' },
                      transform: 'translateY(-2px)',
                      boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
                    },
                    "&.Mui-focused": {
                      bgcolor: alpha('#64b5f6', 0.1),
                      "& fieldset": { borderColor: '#64b5f6', borderWidth: 2 },
                      boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)"
                    }
                  },
                  "& .MuiInputLabel-root": { color: '#90caf9', '&.Mui-focused': { color: '#64b5f6' } },
                  "& .MuiFormHelperText-root": { color: fieldErrors.email ? '#f44336' : alpha('#90caf9', 0.7) }
                }}>
                <InputLabel htmlFor="email-input" sx={{ color: '#90caf9' }}>
                  Correo Electrónico
                </InputLabel>
                <OutlinedInput
                  id="email-input"
                  inputRef={emailRef}
                  type="email"
                  label="Correo Electrónico"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  autoComplete="email"
                  startAdornment={
                    <InputAdornment position="start">
                      <Email sx={{ color: '#64b5f6' }} />
                    </InputAdornment>
                  }
                />
                <FormHelperText>
                  {fieldErrors.email}
                </FormHelperText>
              </FormControl>

              {/* PASSWORD */}
              <FormControl fullWidth required margin="normal" variant="outlined" error={!!fieldErrors.password} disabled={isFormDisabled}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: alpha('#64b5f6', 0.05),
                    color: 'white',
                    transition: "all 0.3s ease",
                    "& fieldset": { borderColor: 'rgba(100, 181, 246, 0.2)' },
                    "&:hover": {
                      bgcolor: alpha('#64b5f6', 0.08),
                      "& fieldset": { borderColor: 'rgba(100, 181, 246, 0.4)' },
                      transform: 'translateY(-2px)',
                      boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
                    },
                    "&.Mui-focused": {
                      bgcolor: alpha('#64b5f6', 0.1),
                      "& fieldset": { borderColor: '#64b5f6', borderWidth: 2 },
                      boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)"
                    }
                  },
                  "& .MuiInputLabel-root": { color: '#90caf9', '&.Mui-focused': { color: '#64b5f6' } },
                  "& .MuiFormHelperText-root": { color: fieldErrors.password ? '#f44336' : alpha('#90caf9', 0.7) }
                }}>
                <InputLabel htmlFor="password-input" sx={{ color: '#90caf9' }}>
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  autoComplete="current-password"
                  startAdornment={
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#64b5f6' }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isFormDisabled}
                        aria-label="alternar visibilidad de contraseña"
                        size="small"
                        sx={{
                          color: '#90caf9',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: '#64b5f6',
                            transform: 'scale(1.1)',
                            bgcolor: alpha('#64b5f6', 0.1)
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText>
                  {fieldErrors.password}
                </FormHelperText>
              </FormControl>

              {/* Submit */}
              <Button type="submit" fullWidth variant="contained" size="large"
                disabled={isFormDisabled || hasErrors}
                sx={{
                  py: 2,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  textTransform: "none",
                  background: loginSuccess
                    ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                    : 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  boxShadow: "0 8px 32px rgba(100, 181, 246, 0.4)",
                  "&:hover": {
                    background: loginSuccess
                      ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                      : 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 40px rgba(100, 181, 246, 0.5)",
                    border: '1px solid rgba(100, 181, 246, 0.5)'
                  },
                  "&:disabled": {
                    background: loginSuccess
                      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                      : alpha('#64b5f6', 0.3),
                    color: loginSuccess ? "#fff" : alpha('#90caf9', 0.5),
                    boxShadow: "none",
                    border: '1px solid rgba(100, 181, 246, 0.1)'
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>
                {isFormDisabled ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={22} sx={{ color: loginSuccess ? 'white' : '#64b5f6', animation: 'pulse 2s infinite' }} />
                    <span>
                      {loginSuccess ? "¡Bienvenido!" : "Verificando..."}
                    </span>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LoginIcon />
                    <span>Iniciar Sesión</span>
                  </Box>
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 4, borderColor: alpha('#64b5f6', 0.2), '&::before, &::after': { borderColor: alpha('#64b5f6', 0.2) } }} />

            <Box sx={{ textAlign: "center" }}>
              <Button variant="text" sx={{
                textTransform: "none", fontWeight: 600, color: '#90caf9', px: 3, py: 1.5, borderRadius: 2, transition: 'all 0.3s ease', "&:hover": {
                  bgcolor: alpha('#64b5f6', 0.1), color: '#64b5f6', transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
                }
              }}>
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: `1px solid ${alpha('#64b5f6', 0.1)}` }}>
              <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.6), fontSize: '0.85rem' }}>
                Acceso seguro y protegido
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoginPage;
