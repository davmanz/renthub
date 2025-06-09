import { Box, Typography, Button, Container, Paper, Fade, Avatar, Slide } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Lock as LockIcon, 
  Home as HomeIcon, 
  Login as LoginIcon,
  Shield as ShieldIcon 
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
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 87, 87, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(255, 87, 87, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 87, 87, 0); }
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

  // Configuración dinámica según el tipo
  const config = {
    'not-authenticated': {
      icon: LoginIcon,
      defaultTitle: '¡Acceso Restringido!',
      defaultMessage: 'Necesitas iniciar sesión para acceder a esta página. Por favor, inicia sesión con tu cuenta para continuar.',
      primaryAction: 'Iniciar Sesión',
      primaryRoute: '/login',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      iconColor: '#ff5757',
      statusCode: '401'
    },
    'insufficient-permissions': {
      icon: ShieldIcon,
      defaultTitle: '¡Permisos Insuficientes!',
      defaultMessage: 'No tienes los permisos necesarios para acceder a esta sección. Contacta al administrador si crees que esto es un error.',
      primaryAction: 'Volver al Dashboard',
      primaryRoute: '/dashboard',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      iconColor: '#f5576c',
      statusCode: '403'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  useEffect(() => {
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

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: currentConfig.bgGradient,
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 0 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, 50%)',
        }
      }}
    >
      <Fade in={isVisible} timeout={1000}>
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${currentConfig.iconColor}, ${currentConfig.iconColor}aa)`,
              }
            }}
          >
            {/* Código de estado animado */}
            <Slide direction="down" in={true} timeout={800}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "4rem", sm: "6rem" },
                  fontWeight: 900,
                  color: currentConfig.iconColor,
                  opacity: 0.1,
                  position: 'absolute',
                  top: { xs: 10, sm: 20 },
                  right: { xs: 10, sm: 20 },
                  userSelect: 'none',
                  animation: `${float} 6s ease-in-out infinite`,
                }}
              >
                {currentConfig.statusCode}
              </Typography>
            </Slide>

            {/* Icono principal con animaciones */}
            <Box sx={{ mb: 3, position: 'relative' }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  bgcolor: currentConfig.iconColor,
                  mx: 'auto',
                  mb: 2,
                  animation: iconAnimation ? `${shake} 0.8s ease-in-out, ${pulse} 2s infinite` : 'none',
                  background: `linear-gradient(45deg, ${currentConfig.iconColor}, ${currentConfig.iconColor}cc)`,
                }}
              >
                <IconComponent sx={{ fontSize: { xs: 40, sm: 50 }, color: 'white' }} />
              </Avatar>
              
              {/* Icono de candado flotante para contexto adicional */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 5, sm: 10 },
                  right: { xs: 5, sm: 10 },
                  animation: `${float} 4s ease-in-out infinite`,
                }}
              >
                <LockIcon 
                  sx={{ 
                    fontSize: { xs: 20, sm: 24 }, 
                    color: currentConfig.iconColor,
                    opacity: 0.6
                  }} 
                />
              </Box>
            </Box>

            {/* Título */}
            <Slide direction="up" in={true} timeout={1000}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  background: `linear-gradient(45deg, ${currentConfig.iconColor}, #333)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                }}
              >
                {title || currentConfig.defaultTitle}
              </Typography>
            </Slide>

            {/* Mensaje */}
            <Slide direction="up" in={true} timeout={1200}>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  maxWidth: "90%", 
                  mx: "auto",
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {message || currentConfig.defaultMessage}
              </Typography>
            </Slide>

            {/* Botones de acción */}
            <Slide direction="up" in={true} timeout={1400}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
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
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    bgcolor: currentConfig.iconColor,
                    color: 'white',
                    minWidth: { xs: '100%', sm: 'auto' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: currentConfig.iconColor,
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: `0 8px 25px ${currentConfig.iconColor}40`
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)'
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
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: currentConfig.iconColor,
                    color: currentConfig.iconColor,
                    minWidth: { xs: '100%', sm: 'auto' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: currentConfig.iconColor,
                      bgcolor: `${currentConfig.iconColor}10`,
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: `0 8px 25px ${currentConfig.iconColor}20`
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)'
                    }
                  }}
                >
                  Ir al Inicio
                </Button>
              </Box>
            </Slide>

            {/* Texto de ayuda adicional */}
            <Slide direction="up" in={true} timeout={1600}>
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                <Typography 
                  variant="caption" 
                  color="text.disabled"
                  sx={{ 
                    fontSize: '0.8rem',
                    fontStyle: 'italic'
                  }}
                >
                  {type === 'not-authenticated' 
                    ? '¿Necesitas ayuda? Contacta al soporte técnico' 
                    : '¿Crees que esto es un error? Contacta al administrador'
                  }
                </Typography>
              </Box>
            </Slide>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default UnauthorizedPage;