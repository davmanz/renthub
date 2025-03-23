import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      bgcolor="#f5f5f5"
      p={4}
    >
      <Typography variant="h1" color="error" fontWeight="bold">
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
      >
        Volver al inicio
      </Button>
    </Box>
  );
};

export default NotFound;
