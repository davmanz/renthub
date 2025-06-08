import { useParams } from "react-router-dom";
import { 
  Box,  Paper,  Fade,  Typography,  CircularProgress,  Slide,  Avatar 
} from "@mui/material";
import { Security,} from "@mui/icons-material";
import { useAccountVerification } from "../components/utils/useAccountVerification";
import { VerificationAlert } from "../components/utils/VerificationAlert";
import { useEffect, useState } from "react";

const VerifyAccountPage = () => {
  const { token } = useParams();
  const { status, fadeIn } = useAccountVerification(token);
  const [countdown, setCountdown] = useState(4);

  // Variables derivadas para mejor legibilidad y mantenimiento
  const isLoading = status === "loading";
  const showResult = status === "success" || status === "error" || status === "invalid";

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          background: 'radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        },
        '@keyframes pulse': {
          '0%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
          '100%': {
            opacity: 1,
          },
        },
      }}
    >
      <Fade in={fadeIn} timeout={1000}>
        <Paper
          elevation={24}
          role="main"
          aria-label="Página de verificación de cuenta"
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "rgba(255, 255, 255, 0.95)",
            color: "text.primary",
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 400, sm: 500 },
            minWidth: { xs: 'auto', sm: 450 },
            borderRadius: { xs: 2, sm: 3 },
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}
        >
          {/* Título */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 2,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              }}
            >
              <Security fontSize="large" />
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              aria-live="polite"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              Verificación de Cuenta
            </Typography>
          </Box>

          {/* Estado de Loading */}
          {isLoading && (
            <Slide direction="up" in={isLoading} timeout={600}>
              <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                <Box position="relative">
                  <CircularProgress 
                    size={60} 
                    thickness={4} 
                    sx={{
                      color: 'primary.main',
                      animationDuration: '2s',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      ✓
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 3, 
                    color: 'text.secondary',
                    fontWeight: 500,
                    textAlign: 'center',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  Verificando tu cuenta...
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    color: 'text.disabled',
                    textAlign: 'center'
                  }}
                >
                  Esto puede tomar unos segundos
                </Typography>
              </Box>
            </Slide>
          )}

          {/* Estado de Resultado */}
          {showResult && (
            <Slide direction="up" in={showResult} timeout={600}>
              <Box>
                <VerificationAlert type={status} countdown={countdown} />
              </Box>
            </Slide>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default VerifyAccountPage;
