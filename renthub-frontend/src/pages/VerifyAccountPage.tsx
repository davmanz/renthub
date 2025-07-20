import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Paper, Fade, Typography, CircularProgress, Slide, alpha, Button
} from "@mui/material";
import { 
  Security, CheckCircle, Error, ArrowForward, Home
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useAccountVerification } from "../components/utils/useAccountVerification";
import { VerificationAlert } from "../components/utils/VerificationAlert";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { TIMING } from "../constants/messages";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(100, 181, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(100, 181, 246, 0.6); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const VerifyAccountPage = () => {
  const { token } = useParams();
  const { status } = useAccountVerification(token);
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(TIMING.REDIRECT_DELAY / 1000);
  const [showResult, setShowResult] = useState(false);

  const isLoading = status === "loading";

  useEffect(() => {
    if (status !== "loading") {
      const timer = setTimeout(() => setShowResult(true), TIMING.FADE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (status === "success" && !isAuthenticated) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const redirectTimer = setTimeout(() => {
        navigate("/login");
      }, TIMING.REDIRECT_DELAY);

      return () => {
        clearInterval(countdownTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [status, isAuthenticated, navigate]);

  const handleNavigation = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/dashboard/admin');
    } else if (isAuthenticated) {
      navigate('/dashboard/user');
    } else {
      navigate('/login');
    }
  };

  const getButtonInfo = () => {
    if (isAuthenticated) {
      return { text: "Volver al Dashboard", icon: <Home /> };
    }
    return { text: "Ir a Login", icon: <ArrowForward /> };
  };

  // Función para obtener el icono según el status
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />;
      case 'error':
      case 'invalid':
        return <Error sx={{ fontSize: 40, color: '#f44336' }} />;
      default:
        return <Security sx={{ fontSize: 40, color: '#64b5f6' }} />;
    }
  };

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
      }}
    >
      <Fade in={true} timeout={1000}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            background: "rgba(15, 20, 25, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100, 181, 246, 0.3)",
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 400, sm: 500 },
            minWidth: { xs: 'auto', sm: 450 },
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)',
              color: "white", 
              p: 4, 
              mb: 4, 
              mx: { xs: -4, sm: -6 }, 
              mt: { xs: -4, sm: -6 },
              textAlign: "center", 
              boxShadow: "0 8px 32px rgba(100, 181, 246, 0.3)",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  bgcolor: alpha('#64b5f6', 0.15), 
                  border: '1px solid rgba(100, 181, 246, 0.3)', 
                  animation: isLoading 
                    ? `${glow} 2s ease-in-out infinite, ${float} 3s ease-in-out infinite` 
                    : `${glow} 2s ease-in-out infinite`
                }}
              >
                {isLoading ? (
                  <Security sx={{ fontSize: 40, color: '#64b5f6' }} />
                ) : (
                  getStatusIcon()
                )}
              </Box>
            </Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
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
              {isLoading ? 'Validando tu identidad' : 
               status === 'success' ? 'Cuenta verificada exitosamente' :
               status === 'error' ? 'Error en la verificación' :
               'Token inválido'}
            </Typography>
          </Box>

          {isLoading && (
            <Slide direction="up" in={isLoading} timeout={600}>
              <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                <CircularProgress 
                  size={80} 
                  thickness={4} 
                  sx={{ 
                    color: '#64b5f6', 
                    mb: 3,
                    animation: `${float} 2s ease-in-out infinite`
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#90caf9', 
                    fontWeight: 600, 
                    animation: `${pulse} 2s infinite` 
                  }}
                >
                  Verificando...
                </Typography>
              </Box>
            </Slide>
          )}

          {showResult && (
            <Slide direction="up" in={showResult} timeout={600}>
              <Box 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: alpha('#64b5f6', 0.05), 
                  border: '1px solid rgba(100, 181, 246, 0.2)' 
                }}
              >
                <VerificationAlert 
                  type={status} 
                  countdown={countdown} 
                  isAuthenticated={isAuthenticated} 
                />
                {(status === 'success' && isAuthenticated) || status === 'error' || status === 'invalid' ? (
                  <Box mt={3} display="flex" justifyContent="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNavigation}
                      endIcon={getButtonInfo().icon}
                      sx={{
                        background: 'linear-gradient(45deg, #42a5f5, #64b5f6)',
                        boxShadow: '0 4px 15px 0 rgba(100, 181, 246, 0.4)',
                        '&:hover': {
                          boxShadow: '0 6px 20px 0 rgba(100, 181, 246, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {getButtonInfo().text}
                    </Button>
                  </Box>
                ) : null}
              </Box>
            </Slide>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default VerifyAccountPage;