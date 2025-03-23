import { useEffect, useState } from "react";
import {
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { ImageUtil } from "../../components/utils/ImageUtil"; // ✅ Importar utilidad

const ProfileSummary = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUser(response.data);
      } catch (error) {
        setError("Error al cargar los datos del usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      {/* Avatar y datos principales */}
      <Box sx={{ textAlign: "center" }}>
        <Avatar
          src={ImageUtil.buildUrl(user?.profile_photo)}
          alt="Foto de perfil"
          sx={{
            width: 100,
            height: 100,
            margin: "auto",
            bgcolor: "#1976d2",
          }}
        />
        <Typography variant="h5" sx={{ mt: 2 }}>
          {`${user?.first_name} ${user?.last_name}`}
        </Typography>
        <Typography variant="body1">{user?.email}</Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: user?.is_active ? "lightgreen" : "red" }}
        >
          {user?.is_active ? "Cuenta Activa" : "Cuenta Inactiva"}
        </Typography>
      </Box>

      <Divider sx={{ my: 3, bgcolor: "gray" }} />

      {/* Información Personal */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Información Personal</Typography>
        <Typography>
          <strong>Teléfono:</strong> {user?.phone_number || "No registrado"}
        </Typography>
        <Typography>
          <strong>Tipo de Documento:</strong> {user?.document_type?.name || "No disponible"}
        </Typography>
        <Typography>
          <strong>Número de Documento:</strong> {user?.document_number}
        </Typography>
        <Typography>
          <strong>Fecha de Registro:</strong> {new Date(user?.date_joined).toLocaleDateString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 3, bgcolor: "gray" }} />

      {/* Estado de Pagos */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Estado de Pagos</Typography>
        {user?.has_pending_payments ? (
          <Chip label="Pagos Pendientes" color="error" />
        ) : (
          <Chip label="Pagos al Día" color="success" />
        )}
      </Box>

      <Divider sx={{ my: 3, bgcolor: "gray" }} />

      {/* Fotos Adjuntas */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Documentos Adjuntos</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          {user?.id_photo && (
            <img
              src={ImageUtil.buildUrl(user.id_photo)}
              alt="Foto de Identificación"
              width="150px"
            />
          )}
          {user?.contract_photo && (
            <img
              src={ImageUtil.buildUrl(user.contract_photo)}
              alt="Foto del Contrato"
              width="150px"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileSummary;
