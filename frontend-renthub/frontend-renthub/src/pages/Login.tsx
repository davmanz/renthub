import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Box
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api/api"; // Importamos axios configurado
import endpoints from "../api/endpoints"; // Importamos los endpoints

const Login = () => {
  const { login } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Intentamos iniciar sesión
      const data = await login(email, password);
      if (!data) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      // Ahora obtenemos el usuario autenticado
      const userResponse = await api.get(endpoints.auth.me);
      const userRole = userResponse.data.role; // Extraemos el rol

      // Redirigimos según el rol del usuario
      if (userRole === "admin" || userRole === "superadmin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/user");
      }
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "rgba(10, 10, 10, 0.9)", 
      }}
    >
      <Card sx={{ 
        width: 400,
        padding: 4, 
        borderRadius: 5, 
        boxShadow: "0px 4px 20px rgba(165, 161, 161, 0.74)", 
        background: "#fff" }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2, py: 1.5, fontWeight: "bold", bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }}
              disabled={loading || !email || !password}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
