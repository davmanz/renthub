import { 
  Box, Typography, Button, Container, Paper, Fade, Avatar, Slide,
  alpha, Stack, IconButton, Tooltip, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Lock as LockIcon, 
  Home as HomeIcon, 
  Login as LoginIcon,
  Shield as ShieldIcon,
  Security, TrendingUp, Hotel, Error as ErrorIcon
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useState, useEffect } from "react";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { box-shadow: 0 0 0 30px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(244, 67, 54, 0.6);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

interface UnauthorizedPageProps {
  type?: 'not-authenticated' | 'insufficient-permissions';
  title?: string;
  message?: string;
}

const UnauthorizedPage = ({ 
  type = 'not-authenticated',
  title,
  message 
}: UnauthorizedPageProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [iconAnimation, setIconAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Configuración dinámica según el tipo
  const config = {
    'not-authenticated': {
      icon: LoginIcon,
      defaultTitle: '¡Acceso Restringido!',
      defaultMessage: 'Necesitas iniciar sesión para acceder a esta página. Por favor, inicia sesión con tu cuenta para continuar.',
      primaryAction: 'Iniciar Sesión',
      primaryRoute: '/login',
      iconColor: '#f44336',
      statusCode: '401',
      chipLabel: 'No autenticado',
      gradientColors: ['#f44336', '#ff6b6b']
    },
    'insufficient-permissions': {
      icon: ShieldIcon,
      defaultTitle: '¡Permisos Insuficientes!',
      defaultMessage: 'No tienes los permisos necesarios para acceder a esta sección. Contacta al administrador si crees que esto es un error.',
      primaryAction: 'Volver al Dashboard',
      primaryRoute: '/dashboard',
      iconColor: '#ff9800',
      statusCode: '403',
      chipLabel: 'Permisos insuficientes',
      gradientColors: ['#ff9800', '#ffb74d']
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  useEffect(() => {
    setMounted(true);
    // Activar animación del icono después de un delay
    const timer = setTimeout(() => {
      setIconAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePrimaryAction = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate(currentConfig.primaryRoute);
    }, 1000);
  };

  const handleHomeAction = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleGoBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 30%, #2c1810 60%, #0f1419 100%)',
        position: "relative",
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 0 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(244, 67, 54, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 152, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(100, 181, 246, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none"
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, transparent 48%, rgba(244, 67, 54, 0.02) 50%, transparent 52%)",
          pointerEvents: "none"
        }
      }}
    >
      {/* Elementos decorativos flotantes */}
      {mounted && (
        <>
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: alpha('#f44336', 0.1),
            animation: `${float} 3s ease-in-out infinite`,
            animationDelay: '0s'
          }} />
          <Box sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: alpha('#ff9800', 0.1),
            animation: `${float} 3s ease-in-out infinite`,
            animationDelay: '1s'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '15%',
            left: '20%',
            width: 25,
            height: 25,
            borderRadius: '50%',
            background: alpha('#64b5f6', 0.1),
            animation: `${float} 3s ease-in-out infinite`,
            animationDelay: '2s'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '25%',
            right: '10%',
            width: 35,
            height: 35,
            borderRadius: '50%',
            background: alpha('#f44336', 0.1),
            animation: `${sparkle} 2s ease-in-out infinite`,
            animationDelay: '0.5s'
          }} />
        </>
      )}

      <Fade in={isVisible} timeout={1000}>
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            sx={{ position: 'relative', zIndex: 10 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 4,
                background: "rgba(15, 20, 25, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(244, 67, 54, 0.1)",
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: 600,
                '&:hover': {
                  boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 100px rgba(244, 67, 54, 0.15)",
                  border: "1px solid rgba(244, 67, 54, 0.4)"
                }
              }}
            >
              {/* Header con gradiente */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, ${currentConfig.iconColor} 100%)`,
                  color: "white",
                  p: 4,
                  mb: 4,
                  mx: -4,
                  mt: { xs: -4, md: -6 },
                  textAlign: "center",
                  position: "relative",
                  overflow: 'hidden',
                  boxShadow: `0 8px 32px ${alpha(currentConfig.iconColor, 0.3)}`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: alpha(currentConfig.iconColor, 0.1),
                    transform: 'rotate(45deg)',
                    zIndex: 1
                  }
                }}
              >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2, 
                    mb: 2 
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      bgcolor: alpha(currentConfig.iconColor, 0.15),
                      border: `1px solid ${alpha(currentConfig.iconColor, 0.3)}`,
                      animation: iconAnimation ? `${glow} 2s ease-in-out infinite` : 'none'
                    }}>
                      <ErrorIcon sx={{ fontSize: 40, color: currentConfig.iconColor }} />
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${currentConfig.gradientColors[0]}, ${currentConfig.gradientColors[1]})`,
                      backgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    Acceso Denegado
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.9,
                      color: alpha('#90caf9', 0.8)
                    }}
                  >
                    No tienes permisos para esta sección
                  </Typography>

                  {/* Chip de estado */}
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={currentConfig.chipLabel}
                      sx={{
                        bgcolor: alpha(currentConfig.iconColor, 0.15),
                        color: currentConfig.iconColor,
                        border: `1px solid ${alpha(currentConfig.iconColor, 0.3)}`,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 4px 12px ${alpha(currentConfig.iconColor, 0.3)}`
                        }
                      }}
                    />
                  </Box>

                  {/* Decorative elements */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 2, 
                    mt: 2,
                    opacity: 0.7
                  }}>
                    <Security sx={{ fontSize: 20, color: '#64b5f6' }} />
                    <TrendingUp sx={{ fontSize: 20, color: '#81c784' }} />
                    <Hotel sx={{ fontSize: 20, color: '#ffb74d' }} />
                  </Box>
                </Box>
              </Box>

              {/* Código de estado con efectos */}
              <Slide direction="down" in={true} timeout={800}>
                <Box sx={{ mb: 4, position: 'relative' }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "6rem", md: "8rem" },
                      fontWeight: 900,
                      background: `linear-gradient(45deg, ${currentConfig.gradientColors[0]}, ${currentConfig.gradientColors[1]}, ${alpha(currentConfig.iconColor, 0.8)})`,
                      backgroundClip: 'text',
                      color: 'transparent',
                      animation: iconAnimation ? `${shake} 0.8s ease-in-out` : 'none',
                      mb: 2,
                      textShadow: `0 0 40px ${alpha(currentConfig.iconColor, 0.5)}`,
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {currentConfig.statusCode}
                  </Typography>
                  
                  {/* Glow effect behind status code */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle, ${alpha(currentConfig.iconColor, 0.2)} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    zIndex: 1,
                    animation: `${glow} 3s ease-in-out infinite`
                  }} />
                </Box>
              </Slide>

              {/* Icono principal con animaciones */}
              <Slide direction="up" in={true} timeout={1000}>
                <Box sx={{ mb: 3, position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      mx: 'auto',
                      mb: 3,
                      background: `linear-gradient(45deg, ${currentConfig.iconColor}, ${alpha(currentConfig.iconColor, 0.8)})`,
                      border: `3px solid ${alpha(currentConfig.iconColor, 0.3)}`,
                      boxShadow: `0 8px 24px ${alpha(currentConfig.iconColor, 0.4)}`,
                      animation: iconAnimation ? `${pulse} 2s infinite` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 12px 32px ${alpha(currentConfig.iconColor, 0.5)}`
                      }
                    }}
                  >
                    <IconComponent sx={{ fontSize: { xs: 50, sm: 60 }, color: 'white' }} />
                  </Avatar>
                  
                  {/* Icono de candado flotante */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: { xs: 10, sm: 15 },
                      right: { xs: '35%', sm: '38%' },
                      animation: `${float} 4s ease-in-out infinite`,
                    }}
                  >
                    <LockIcon 
                      sx={{ 
                        fontSize: { xs: 24, sm: 28 }, 
                        color: currentConfig.iconColor,
                        opacity: 0.8,
                        filter: `drop-shadow(0 0 8px ${alpha(currentConfig.iconColor, 0.5)})`
                      }} 
                    />
                  </Box>
                </Box>
              </Slide>

              {/* Título */}
              <Slide direction="up" in={true} timeout={1200}>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: '#90caf9'
                  }}
                >
                  {title || currentConfig.defaultTitle}
                </Typography>
              </Slide>

              {/* Mensaje */}
              <Slide direction="up" in={true} timeout={1400}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 4, 
                    maxWidth: "90%", 
                    mx: "auto",
                    lineHeight: 1.6,
                    color: alpha('#90caf9', 0.8)
                  }}
                >
                  {message || currentConfig.defaultMessage}
                </Typography>
              </Slide>

              {/* Botones de acción */}
              <Slide direction="up" in={true} timeout={1600}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ mb: 3 }}
                  justifyContent="center"
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<IconComponent />}
                    onClick={handlePrimaryAction}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      background: `linear-gradient(135deg, ${currentConfig.iconColor} 0%, ${alpha(currentConfig.iconColor, 0.8)} 100%)`,
                      border: `1px solid ${alpha(currentConfig.iconColor, 0.3)}`,
                      boxShadow: `0 8px 32px ${alpha(currentConfig.iconColor, 0.4)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(currentConfig.iconColor, 0.9)} 0%, ${alpha(currentConfig.iconColor, 0.7)} 100%)`,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 40px ${alpha(currentConfig.iconColor, 0.5)}`,
                        border: `1px solid ${alpha(currentConfig.iconColor, 0.5)}`
                      }
                    }}
                  >
                    {currentConfig.primaryAction}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<HomeIcon />}
                    onClick={handleHomeAction}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      color: '#64b5f6',
                      borderColor: 'rgba(100, 181, 246, 0.3)',
                      bgcolor: alpha('#64b5f6', 0.05),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#64b5f6',
                        bgcolor: alpha('#64b5f6', 0.1),
                        transform: 'translateY(-2px)',
                        boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)"
                      }
                    }}
                  >
                    Ir al Inicio
                  </Button>
                </Stack>
              </Slide>

              {/* Botones de acción secundarios */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                pt: 3,
                borderTop: `1px solid ${alpha('#64b5f6', 0.2)}`
              }}>
                <Tooltip title="Ir atrás" arrow>
                  <IconButton
                    onClick={handleGoBack}
                    sx={{
                      bgcolor: alpha('#64b5f6', 0.1),
                      border: '1px solid rgba(100, 181, 246, 0.3)',
                      color: '#64b5f6',
                      width: 48,
                      height: 48,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#64b5f6', 0.2),
                        transform: 'scale(1.1)',
                        boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)"
                      }
                    }}
                  >
                    <LockIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Ayuda" arrow>
                  <IconButton
                    sx={{
                      bgcolor: alpha('#81c784', 0.1),
                      border: '1px solid rgba(129, 199, 132, 0.3)',
                      color: '#81c784',
                      width: 48,
                      height: 48,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#81c784', 0.2),
                        transform: 'scale(1.1)',
                        boxShadow: "0 8px 24px rgba(129, 199, 132, 0.3)"
                      }
                    }}
                  >
                    <Security />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Footer decorativo */}
              <Box sx={{ 
                textAlign: 'center', 
                mt: 4, 
                pt: 3,
                borderTop: `1px solid ${alpha('#64b5f6', 0.1)}`
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: alpha('#90caf9', 0.6),
                    fontSize: '0.85rem'
                  }}
                >
                  {type === 'not-authenticated' 
                    ? '¿Necesitas ayuda? Contacta al soporte técnico' 
                    : '¿Crees que esto es un error? Contacta al administrador'
                  }
                </Typography>
              </Box>

              {/* Elemento decorativo */}
              <Box sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: alpha(currentConfig.iconColor, 0.05),
                transform: 'rotate(45deg)',
                zIndex: 1
              }} />
            </Paper>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
};

export default UnauthorizedPage;