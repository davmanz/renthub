import { useParams } from "react-router-dom";
import { 
  Box, Paper, Fade, Typography, CircularProgress, Slide, alpha
} from "@mui/material";
import { 
  Security, CheckCircle, TrendingUp, Hotel 
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useAccountVerification } from "../components/utils/useAccountVerification";
import { VerificationAlert } from "../components/utils/VerificationAlert";
import { useEffect, useState } from "react";

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
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

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(100, 181, 246, 0.6);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const VerifyAccountPage = () => {
  const { token } = useParams();
  const { status, fadeIn } = useAccountVerification(token);
  const [countdown, setCountdown] = useState(4);
  const [mounted, setMounted] = useState(false);

  // Variables derivadas para mejor legibilidad y mantenimiento
  const isLoading = status === "loading";
  const showResult = status === "success" || status === "error" || status === "invalid";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 30%, #2c1810 60%, #0f1419 100%)',
        position: "relative",
        overflow: 'hidden',
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
            background: alpha('#ba68c8', 0.1),
            animation: `${sparkle} 2s ease-in-out infinite`,
            animationDelay: '0.5s'
          }} />
        </>
      )}

      <Fade in={fadeIn} timeout={1000}>
        <Paper
          elevation={0}
          role="main"
          aria-label="Página de verificación de cuenta"
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            background: "rgba(15, 20, 25, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100, 181, 246, 0.3)",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(100, 181, 246, 0.1)",
            transition: 'all 0.3s ease',
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 400, sm: 500 },
            minWidth: { xs: 'auto', sm: 450 },
            '&:hover': {
              boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 100px rgba(100, 181, 246, 0.15)",
              border: "1px solid rgba(100, 181, 246, 0.4)",
              transform: 'translateY(-4px)'
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
              mx: { xs: -4, sm: -6 },
              mt: { xs: -4, sm: -6 },
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
                  bgcolor: alpha('#64b5f6', 0.15),
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  animation: `${glow} 2s ease-in-out infinite`
                }}>
                  <Security sx={{ fontSize: 40, color: '#64b5f6' }} />
                </Box>
              </Box>
              
              <Typography
                variant="h4"
                component="h1"
                aria-live="polite"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  background: 'linear-gradient(45deg, #64b5f6, #90caf9)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  mb: 1
                }}
              >
                Verificación de Cuenta
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  color: alpha('#90caf9', 0.8)
                }}
              >
                Validando tu identidad
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

          {/* Estado de Loading */}
          {isLoading && (
            <Slide direction="up" in={isLoading} timeout={600}>
              <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                <Box 
                  position="relative"
                  sx={{
                    p: 3,
                    borderRadius: '50%',
                    bgcolor: alpha('#64b5f6', 0.05),
                    border: '1px solid rgba(100, 181, 246, 0.2)',
                    mb: 3
                  }}
                >
                  <CircularProgress 
                    size={80} 
                    thickness={4} 
                    sx={{
                      color: '#64b5f6',
                      animationDuration: '2s',
                      filter: 'drop-shadow(0 0 10px rgba(100, 181, 246, 0.5))'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2
                    }}
                  >
                    <CheckCircle 
                      sx={{ 
                        fontSize: 32,
                        color: '#64b5f6',
                        animation: `${pulse} 2s infinite`
                      }} 
                    />
                  </Box>
                  
                  {/* Glow effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(100, 181, 246, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 1,
                    animation: `${glow} 3s ease-in-out infinite`
                  }} />
                </Box>

                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#90caf9',
                    fontWeight: 600,
                    textAlign: 'center',
                    animation: `${pulse} 2s infinite`,
                    mb: 1
                  }}
                >
                  Verificando tu cuenta...
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: alpha('#90caf9', 0.7),
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}
                >
                  Esto puede tomar unos segundos. Por favor, no cierres esta ventana.
                </Typography>

                {/* Progress steps visual */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#64b5f6', 0.05),
                  border: '1px solid rgba(100, 181, 246, 0.2)'
                }}>
                  {[1, 2, 3].map((step, index) => (
                    <Box
                      key={step}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#64b5f6',
                        opacity: 0.3,
                        animation: `${pulse} 1.5s infinite`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Slide>
          )}

          {/* Estado de Resultado */}
          {showResult && (
            <Slide direction="up" in={showResult} timeout={600}>
              <Box sx={{ 
                p: 3,
                borderRadius: 3,
                bgcolor: alpha('#64b5f6', 0.05),
                border: '1px solid rgba(100, 181, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Enhanced VerificationAlert */}
                <VerificationAlert type={status} countdown={countdown} />
                
                {/* Decorative background */}
                <Box sx={{
                  position: 'absolute',
                  bottom: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: alpha('#64b5f6', 0.05),
                  transform: 'rotate(45deg)',
                  zIndex: 1
                }} />
              </Box>
            </Slide>
          )}

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
              Verificación segura y encriptada
            </Typography>
          </Box>

          {/* Elemento decorativo principal */}
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
      </Fade>
    </Box>
  );
};

export default VerifyAccountPage;
