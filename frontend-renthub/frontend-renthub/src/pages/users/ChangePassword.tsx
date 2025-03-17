import { useState } from "react";
import { Typography, Paper, TextField, Button, CircularProgress, Alert, Box } from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(endpoints.auth.changePassword, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (response.status === 200) {
        setSuccess("Contraseña actualizada correctamente.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("Error al cambiar la contraseña.");
      }
    } catch (err) {
      setError("Error al actualizar la contraseña. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      <Typography variant="h5">Cambiar Contraseña</Typography>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Contraseña Actual"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Nueva Contraseña"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Confirmar Nueva Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Actualizar Contraseña"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChangePassword;
