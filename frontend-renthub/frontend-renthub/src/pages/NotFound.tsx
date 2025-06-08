import { Box, Typography, Button, Container, Paper, Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon } from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useState } from "react";

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

const NotFound = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleReturn = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate("/");
    }, 1000); // Espera a que termine la animación de fade out
  };

  return (
    <Fade in={isVisible} timeout={1000}>
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          textAlign="center"
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
            }}
          >
            <Typography
              variant="h1"
              color="error"
              fontWeight="bold"
              sx={{
                fontSize: "8rem",
                animation: `${bounce} 2s ease infinite`,
                mb: 2
              }}
            >
              404
            </Typography>
            <Typography variant="h4" gutterBottom fontWeight="medium">
              ¡Ups! Página no encontrada
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              mb={4}
              sx={{ maxWidth: "80%", mx: "auto" }}
            >
              Lo sentimos, la página que estás buscando parece haberse perdido en el ciberespacio.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleReturn}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              Volver al inicio
            </Button>
          </Paper>
        </Box>
      </Container>
    </Fade>
  );
};

export default NotFound;
