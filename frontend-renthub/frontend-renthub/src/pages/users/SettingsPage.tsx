import {
  Typography,
  Paper,
  TextField,
  Grid,
  Alert,
  Avatar,
  Box,

  Chip,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const allowedFields = [
  { value: "first_name", label: "Nombre" },
  { value: "last_name", label: "Apellido" },
  { value: "email", label: "Correo electrónico" },
  { value: "document_number", label: "Número de documento" },
];

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoMessage, setPhotoMessage] = useState("");

  const [fieldToChange, setFieldToChange] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [changeRequests, setChangeRequests] = useState([]);
  const [requestMessage, setRequestMessage] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const fetchUser = async () => {
    try {
      const res = await api.get(endpoints.auth.me);
      setUser(res.data);
    } catch {}
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get(endpoints.changeRequests.list);
      setChangeRequests(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchUser();
    fetchRequests();
  }, []);
  

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {
      setPhotoMessage("Por favor selecciona una imagen.");
      return;
    }
  
    const formData = new FormData();
    formData.append("profile_photo", selectedFile);
  
    // 👇 Revisa lo que estás enviando
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      await api.patch(endpoints.auth.me, formData);
      setPhotoMessage("Foto actualizada correctamente.");
      fetchUser();
    } catch {
      setPhotoMessage("Error al subir la foto.");
    }
  };


  

  const handleRequestSubmit = async () => {
    try {
      await api.post(endpoints.changeRequests.create, {
        field: fieldToChange,
        current_value: currentValue,
        new_value: newValue,
      });
      setRequestMessage("Solicitud enviada para revisión.");
      setFieldToChange("");
      setCurrentValue("");
      setNewValue("");
      fetchRequests();
    } catch (err: any) {
      if (err.response?.data?.non_field_errors) {
        setRequestMessage(err.response.data.non_field_errors[0]);
      } else {
        setRequestMessage("Error al enviar la solicitud.");
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== repeatPassword) {
      setPasswordMessage("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      await api.post(endpoints.changeRequests.create, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_repeat: repeatPassword,
      });
      setPasswordMessage("Contraseña actualizada correctamente.");
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch {
      setPasswordMessage("Error al actualizar la contraseña.");
    }
  };

  return (
    <Paper sx={{ p: 3, bgcolor: "#1e1e1e", color: "#f5f5f5" }}>
      <Typography variant="h5" gutterBottom>
        Configuración de Usuario
      </Typography>
  
      {/* 🖼 FOTO DE PERFIL */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Foto de Perfil
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
        <Avatar src={user?.profile_picture} sx={{ width: 80, height: 80 }} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          style={{ color: "#f5f5f5" }}
        />
        <Chip
          icon={<Edit />}
          label="Subir nueva foto"
          onClick={handlePhotoSubmit}
          clickable
          sx={{
            bgcolor: "#3949ab",
            color: "white",
            fontSize: "0.8rem",
            px: 1.5,
            "& .MuiChip-icon": {
              color: "white",
            },
            "&:hover": {
              bgcolor: "#5c6bc0",
            },
          }}
        />
      </Box>
      {photoMessage && (
        <Alert sx={{ mt: 1 }} severity="info">
          {photoMessage}
        </Alert>
      )}
  
      {/* 🧍 DATOS PERSONALES */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Datos Personales
      </Typography>
      <Grid container spacing={2}>
        {allowedFields.map((field) => (
          <Grid item xs={12} md={6} key={field.value}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#2c2c2c",
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography sx={{ color: "#f5f5f5" }}>
                <strong>{field.label}:</strong> {user?.[field.value] || "—"}
              </Typography>
              <Chip
                icon={<Edit />}
                label="Solicitar"
                onClick={() => {
                  setFieldToChange(field.value);
                  setCurrentValue(user?.[field.value] || "");
                  setNewValue("");
                }}
                size="small"
                sx={{
                  bgcolor: "#3949ab",
                  color: "white",
                  fontSize: "0.8rem",
                  px: 1.5,
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                  "&:hover": {
                    bgcolor: "#5c6bc0",
                  },
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
  
      {/* ✏️ FORMULARIO DE CAMBIO */}
      {fieldToChange && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Solicitud de Cambio</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Valor actual"
                fullWidth
                value={currentValue}
                disabled
                InputProps={{ style: { color: "#f5f5f5" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Nuevo valor"
                fullWidth
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                InputProps={{ style: { color: "#f5f5f5" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Chip
                icon={<Edit />}
                label="Enviar solicitud"
                onClick={handleRequestSubmit}
                clickable
                sx={{
                  mt: 1.5,
                  bgcolor: "#3949ab",
                  color: "white",
                  "& .MuiChip-icon": { color: "white" },
                  "&:hover": { bgcolor: "#5c6bc0" },
                }}
              />
            </Grid>
            {requestMessage && (
              <Grid item xs={12}>
                <Alert severity="info">{requestMessage}</Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
  
      {/* 📋 HISTORIAL DE SOLICITUDES */}
      {changeRequests.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4 }}>
            Mis Solicitudes
          </Typography>
          {changeRequests.map((req) => (
            <Box
              key={req.id}
              sx={{
                mt: 2,
                p: 2,
                border: "1px solid #555",
                borderRadius: 2,
                bgcolor: "#2c2c2c",
              }}
            >
              <Typography>
                <strong>Campo:</strong> {req.field}
              </Typography>
              <Typography>
                <strong>De:</strong> {req.current_value}
              </Typography>
              <Typography>
                <strong>A:</strong> {req.new_value}
              </Typography>
              <Typography>
                <strong>Estado:</strong> {req.status}
              </Typography>
              {req.review_comment && (
                <Typography>
                  <strong>Comentario:</strong> {req.review_comment}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}
  
      {/* 🔐 CAMBIO DE CONTRASEÑA */}
      <Typography variant="h6" sx={{ mt: 6 }}>
        Cambiar Contraseña
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Contraseña actual"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{ style: { color: "#f5f5f5" } }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{ style: { color: "#f5f5f5" } }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Repetir nueva contraseña"
            type="password"
            fullWidth
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            InputProps={{ style: { color: "#f5f5f5" } }}
            InputLabelProps={{ style: { color: "#aaa" } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Chip
            icon={<Edit />}
            label="Cambiar contraseña"
            onClick={handlePasswordSubmit}
            clickable
            sx={{
              mt: 1,
              bgcolor: "#3949ab",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
              "&:hover": { bgcolor: "#5c6bc0" },
            }}
          />
        </Grid>
        {passwordMessage && (
          <Grid item xs={12}>
            <Alert severity="info">{passwordMessage}</Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
  
};

export default SettingsPage;
