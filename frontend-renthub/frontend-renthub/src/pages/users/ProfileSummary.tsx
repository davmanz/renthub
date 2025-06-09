import { useEffect, useState } from "react";
import {
  Avatar, Box, Card, CardContent, Grid, Typography, Chip, Divider,
  Skeleton, Tooltip, Button,
} from "@mui/material";
import {
  AccountCircle,
  Payment,
  Folder,
  Verified,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string;
  is_verified: boolean;
  phone_number?: string;
  document_type?: { name: string };
  document_number?: string;
  date_joined?: string;
  status_user?: "overdue" | "pending_review" | "ok";
}
const API_BASE_URL = import.meta.env.VITE_API_URL;
const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Skeleton variant="rectangular" height={300} />
    </Grid>
    <Grid item xs={12} md={8}>
      <Skeleton variant="rectangular" height={300} />
    </Grid>
  </Grid>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <Box display="flex" flexDirection="column" alignItems="center" p={3}>
    <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
    <Typography variant="h6" color="error" gutterBottom>
      Error al cargar el perfil
    </Typography>
    <Typography color="textSecondary">{message}</Typography>
  </Box>
);

const AttachedDocuments = () => (
  <Box textAlign="center" py={2}>
    <Typography variant="body2" color="textSecondary" gutterBottom>
      Próximamente podrás gestionar tus documentos aquí
    </Typography>
    <Button
      startIcon={<CloudUploadIcon />}
      variant="outlined"
      disabled
      sx={{ mt: 1 }}
    >
      Subir documentos
    </Button>
  </Box>
);

const ProfileSummary = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(endpoints.auth.me);
        setUser(res.data);
      } catch {
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getStatusChip = () => {
    const statusInfo: Record<string, string> = {
      overdue: "Tienes pagos pendientes que requieren tu atención inmediata",
      pending_review: "Tus documentos están siendo revisados por nuestro equipo",
      ok: "Todos tus pagos están al día",
    };

    const color =
      user?.status_user === "overdue"
        ? "error"
        : user?.status_user === "pending_review"
        ? "warning"
        : "success";

    const label =
      user?.status_user === "overdue"
        ? "Pago Vencido"
        : user?.status_user === "pending_review"
        ? "En Revisión"
        : "Pagos al Día";

    return (
      <Tooltip title={statusInfo[user?.status_user || ""] || "Estado no definido"}>
        <Chip label={label} color={color as any} variant="outlined" sx={{ px: 2 }} />
      </Tooltip>
    );
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Grid container spacing={3}>
      {/* Perfil */}
      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Avatar
            src={user?.profile_photo ? `${API_BASE_URL}${user.profile_photo}` : ""}
            alt={user?.first_name || "Avatar"}
            sx={{
              width: 90,
              height: 90,
              margin: "0 auto",
              border: "3px solid #1976d2",
              boxShadow: 3,
            }}
            >
            {!user?.profile_photo && <AccountCircle sx={{ width: 90, height: 90 }} />}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>

            {user?.is_verified ? (
              <Chip
                icon={<Verified />}
                label="Verificado"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            ) : (
              <Chip
                label="No verificado"
                color="default"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Información personal */}
      <Grid item xs={12} md={8}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Teléfono
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.phone_number || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Tipo de Documento
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.document_type?.name || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Número de Documento
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.document_number || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha de Registro
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(user?.date_joined)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Estado de pagos */}
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Payment sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Estado de Pagos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {getStatusChip()}
          </CardContent>
        </Card>
      </Grid>

      {/* Documentos adjuntos */}
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Folder sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Documentos Adjuntos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <AttachedDocuments />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProfileSummary;
