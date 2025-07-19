import { Alert, Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MESSAGES } from "../../constants/messages";

interface VerificationAlertProps {
  type: "success" | "error" | "invalid";
  countdown?: number;
  isAuthenticated?: boolean;
}

export const VerificationAlert = ({ type, countdown, isAuthenticated }: VerificationAlertProps) => {
  const navigate = useNavigate();

  if (type === "success") {
    return (
      <Alert severity="success" variant="filled" sx={{ mt: 3 }}>
        <Typography variant="body1" fontWeight="500">{MESSAGES.SUCCESS}</Typography>
        {!isAuthenticated && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Serás redirigido al inicio de sesión en {countdown} segundos...
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <>
      <Alert severity="error" variant="filled" sx={{ mt: 3 }}>
        <Typography variant="body1" fontWeight="500">
          {type === "error" ? MESSAGES.ERROR : MESSAGES.INVALID}
        </Typography>
      </Alert>
      {!isAuthenticated && (
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
          >
            Volver al inicio
          </Button>
        </Box>
      )}
    </>
  );
};
