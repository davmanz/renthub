import { 
  Box, Typography, Button, Container, Paper, Fade, 
  alpha, Stack, IconButton, Tooltip 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Home as HomeIcon, Search, ArrowBack, Refresh,
  ErrorOutline, TrendingUp, Security, Hotel
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useState, useEffect } from "react";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(100, 181, 246, 0.6);
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

const NotFound = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReturn = () => {
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSearch = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate("/dashboard/user");
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
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, transparent 48%, rgba(100, 181, 246, 0.02) 50%, transparent 52%)",
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
            background: alpha('#64b5f6', 0.1),
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
            background: alpha('#81c784', 0.1),
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
            background: alpha('#ffb74d', 0.1),
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
            background: alpha('#f06292', 0.1),
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
                p: { xs: 4, md: 8 },
                borderRadius: 4,
                background: "rgba(15, 20, 25, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(100, 181, 246, 0.3)",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(100, 181, 246, 0.1)",
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: 600,
                '&:hover': {
                  boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 100px rgba(100, 181, 246, 0.15)",
                  border: "1px solid rgba(100, 181, 246, 0.4)"
                }
              }}
            >
              {/* Header con gradiente */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)',
                  color: "white",
                  p: 4,
                  mb: 4,
                  mx: -4,
                  mt: -4,
                  textAlign: "center",
                  position: "relative",
                  overflow: 'hidden',
                  boxShadow: "0 8px 32px rgba(100, 181, 246, 0.3)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: alpha('#64b5f6', 0.1),
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
                      bgcolor: alpha('#f44336', 0.15),
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      animation: `${glow} 2s ease-in-out infinite`
                    }}>
                      <ErrorOutline sx={{ fontSize: 40, color: '#f44336' }} />
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #f44336, #ff6b6b)',
                      backgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    Página No Encontrada
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.9,
                      color: alpha('#90caf9', 0.8)
                    }}
                  >
                    La página que buscas no existe
                  </Typography>

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

              {/* Número 404 con efectos */}
              <Box sx={{ mb: 4, position: 'relative' }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "6rem", md: "10rem" },
                    fontWeight: 900,
                    background: 'linear-gradient(45deg, #64b5f6, #90caf9, #42a5f5)',
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: `${bounce} 2s ease infinite`,
                    mb: 2,
                    textShadow: '0 0 40px rgba(100, 181, 246, 0.5)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  404
                </Typography>
                
                {/* Glow effect behind 404 */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(100, 181, 246, 0.2) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: 1,
                  animation: `${glow} 3s ease-in-out infinite`
                }} />
              </Box>

              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: '#90caf9',
                  mb: 2
                }}
              >
                ¡Ups! Página no encontrada
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: alpha('#90caf9', 0.8),
                  mb: 4,
                  maxWidth: "80%", 
                  mx: "auto",
                  lineHeight: 1.6
                }}
              >
                Lo sentimos, la página que estás buscando parece haberse perdido en el ciberespacio. 
                Pero no te preocupes, podemos ayudarte a encontrar tu camino de vuelta.
              </Typography>

              {/* Botones de acción */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mb: 3 }}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleReturn}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                    border: '1px solid rgba(100, 181, 246, 0.3)',
                    boxShadow: "0 8px 32px rgba(100, 181, 246, 0.4)",
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                      transform: 'translateY(-4px)',
                      boxShadow: "0 12px 40px rgba(100, 181, 246, 0.5)",
                      border: '1px solid rgba(100, 181, 246, 0.5)'
                    }
                  }}
                >
                  Volver al Inicio
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={handleGoBack}
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
                  Ir Atrás
                </Button>
              </Stack>

              {/* Botones de acción secundarios */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                pt: 3,
                borderTop: `1px solid ${alpha('#64b5f6', 0.2)}`
              }}>
                <Tooltip title="Buscar en el sitio" arrow>
                  <IconButton
                    onClick={handleSearch}
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
                    <Search />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Recargar página" arrow>
                  <IconButton
                    onClick={handleRefresh}
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
                    <Refresh />
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
                  Error 404 - Recurso no encontrado
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
                background: alpha('#64b5f6', 0.05),
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

export default NotFound;
