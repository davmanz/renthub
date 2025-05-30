import {
  Typography, Paper, TextField, Grid, Alert,
  Avatar, Box, Chip,  Skeleton, MenuItem, Select,
  FormControl, InputLabel,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import {ChangeRequest , Changes} from "../../types/types"

const allowedFields = [
  { value: "first_name", label: "Nombre" },
  { value: "last_name", label: "Apellido" },
  { value: "email", label: "Correo electrónico" },
  { value: "phone_number", label: "Número de teléfono" },
  { value: "document_type", label: "Tipo de documento" },
  { value: "document_number", label: "Número de documento" },
];



const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoMessage, setPhotoMessage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [fieldToChange, setFieldToChange] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get(endpoints.auth.me);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get(endpoints.changeRequests.list);
      setChangeRequests(res.data);
    } catch {
      setChangeRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await api.get(endpoints.userManagement.documentTypes);
      setDocumentTypes(res.data);
    } catch {
      setDocumentTypes([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRequests();
    fetchDocumentTypes();
  }, []);

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {
      setPhotoMessage("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_photo", selectedFile);

    setUploadingPhoto(true);
    try {
      await api.patch(endpoints.auth.me, formData);
      setPhotoMessage("Foto actualizada correctamente.");
      fetchUser();
    } catch {
      setPhotoMessage("Error al subir la foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRequestSubmit = async () => {
    if (!newValue.trim()) {
      setRequestMessage("Debes ingresar un nuevo valor.");
      return;
    }

    setSubmittingRequest(true);
    try {
      // Crear el objeto changes usando la interfaz Changes
      const requestChanges: { changes: Partial<Changes> } = {
        changes: {
          [fieldToChange as keyof Changes]: newValue
        }
      };

      await api.post(endpoints.changeRequests.create, requestChanges);
      
      // Limpiar el formulario y actualizar la lista
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
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Agregar esta función auxiliar después de las declaraciones de estados
  const isFieldPending = (fieldName: string) => {
    return changeRequests.some(
      (req) => 
        Object.keys(req.changes)[0] === fieldName && 
        (req.status === "pending")
    );
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
        {loadingUser ? (
          <Skeleton variant="circular" width={80} height={80} />
        ) : (
          <Avatar src={user?.profile_photo} sx={{ width: 80, height: 80 }} />
        )}
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
          disabled={uploadingPhoto}
          sx={{
            bgcolor: "#3949ab",
            color: "white",
            fontSize: "0.8rem",
            px: 1.5,
            "& .MuiChip-icon": { color: "white" },
            "&:hover": { bgcolor: "#5c6bc0" },
          }}
        />
      </Box>
      {photoMessage && <Alert sx={{ mt: 1 }} severity="info">{photoMessage}</Alert>}

      {/* 🧍 DATOS PERSONALES */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Datos Personales
      </Typography>
      <Grid container spacing={2}>
        {loadingUser
          ? [...Array(4)].map((_, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Skeleton height={70} variant="rectangular" />
              </Grid>
            ))
          : allowedFields.map((field) => (
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
                  <Typography>
                    <strong>{field.label}:</strong>{" "}
                    {field.value === "document_type"
                      ? documentTypes.find((d) => d.id === user?.document_type.id)?.name || "—"
                      : user?.[field.value] || "—"}
                  </Typography>
                  <Chip
                    icon={<Edit />}
                    label={isFieldPending(field.value) ? "En revisión" : "Solicitar"}
                    onClick={() => {
                      if (!isFieldPending(field.value)) {
                        setFieldToChange(field.value);
                        setCurrentValue(user?.[field.value] || "");
                        setNewValue("");
                      }
                    }}
                    size="small"
                    sx={{
                      bgcolor: isFieldPending(field.value) ? "#666" : "#3949ab",
                      color: "white",
                      fontSize: "0.8rem",
                      px: 1.5,
                      "& .MuiChip-icon": { color: "white" },
                      "&:hover": { 
                        bgcolor: isFieldPending(field.value) ? "#666" : "#5c6bc0" 
                      },
                      cursor: isFieldPending(field.value) ? "not-allowed" : "pointer",
                    }}
                    disabled={isFieldPending(field.value)}
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
                value={
                  fieldToChange === "document_type"
                    ? documentTypes.find((d) => d.id === currentValue)?.name || currentValue
                    : currentValue
                }
                disabled
              />
            </Grid>

            <Grid item xs={12} md={4}>
              {fieldToChange === "document_type" ? (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#ccc" }}>Nuevo tipo</InputLabel>
                  <Select
                    value={newValue}
                    label="Nuevo tipo"
                    onChange={(e) => setNewValue(e.target.value)}
                    sx={{ color: "white", bgcolor: "#2c2c2c" }}
                  >
                    {documentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Nuevo valor"
                  fullWidth
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Chip
                icon={<Edit />}
                label="Enviar solicitud"
                onClick={handleRequestSubmit}
                clickable
                disabled={submittingRequest}
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
      <Typography variant="h6" sx={{ mt: 4 }}>
        Mis Solicitudes
      </Typography>
      {loadingRequests ? (
        [...Array(2)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ my: 1 }} />
        ))
      ) : changeRequests.length > 0 ? (
        changeRequests.map((req) => (
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
              <strong>Campo:</strong> {
              allowedFields.find(
                field => field.value === Object.keys(req.changes)[0])?.label ||
                Object.keys(req.changes)[0]}
            </Typography>
            <Typography>
              <strong>Nuevo valor:</strong> {Object.values(req.changes)[0]}
            </Typography>
            <Typography>
              <strong>Estado:</strong> {req.status}
            </Typography>
            <Typography>
              <strong>Fecha:</strong> {new Date(req.created_at).toLocaleDateString()}
            </Typography>
            {req.review_comment && (
              <Typography>
                <strong>Comentario:</strong> {req.review_comment}
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography>No hay solicitudes registradas.</Typography>
      )}
    </Paper>
  );
};

export default SettingsPage;
