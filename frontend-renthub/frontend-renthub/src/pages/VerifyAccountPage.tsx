import { useParams } from "react-router-dom";
import { Box, Paper, Fade, Typography, CircularProgress } from "@mui/material";
import { useAccountVerification } from "../components/utils/useAccountVerification";
import { VerificationAlert } from "../components/utils/VerificationAlert";
import { useEffect, useState } from "react";

const VerifyAccountPage = () => {
  const { token } = useParams();
  const { status, fadeIn } = useAccountVerification(token);
  const [countdown, setCountdown] = useState(4);

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
      height="100vh"
      sx={{
        background: 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)',
      }}
    >
      <Fade in={fadeIn} timeout={800}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            bgcolor: "rgba(30, 30, 30, 0.95)",
            color: "white",
            minWidth: 400,
            borderRadius: 2,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: 600,
              mb: 3,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Verificación de Cuenta
          </Typography>

          {status === "loading" && (
            <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Verificando tu cuenta...
              </Typography>
            </Box>
          )}

          {(status === "success" || status === "error" || status === "invalid") && (
            <VerificationAlert type={status} countdown={countdown} />
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default VerifyAccountPage;
