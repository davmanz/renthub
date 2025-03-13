import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import SelectUserModal from "./modals/CreateContract/SelectUserModal";
import SelectRoomModal from "./modals/CreateContract/SelectRoomModal";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const CreateContract = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user: "",
    room: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    deposit_amount: "",
    includes_wifi: "false",
    wifi_cost: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const handleUserSelect = (userId: string) => {
    setFormData({ ...formData, user: userId });
    setUserModalOpen(false);
  };

  const handleRoomSelect = (roomId: string) => {
    setFormData({ ...formData, room: roomId });
    setRoomModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post(endpoints.createContract.contracts, formData);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/admin"), 2000);
    } catch (err) {
      setError("Error al crear el contrato. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 3, mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Crear Nuevo Contrato
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Contrato creado exitosamente.</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Botón para abrir modal de selección de usuario */}
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" onClick={() => setUserModalOpen(true)}>
                  Seleccionar Usuario
                </Button>
                <TextField fullWidth label="Usuario" value={formData.user} disabled />
              </Grid>

              {/* Botón para abrir modal de selección de habitación */}
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" onClick={() => setRoomModalOpen(true)}>
                  Seleccionar Habitación
                </Button>
                <TextField fullWidth label="Habitación" value={formData.room} disabled />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Fecha de Inicio" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Fecha de Fin" type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Monto de Renta" name="rent_amount" value={formData.rent_amount} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Depósito" name="deposit_amount" value={formData.deposit_amount} onChange={handleChange} required />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Incluye WiFi</InputLabel>
                  <Select name="includes_wifi" value={formData.includes_wifi} onChange={handleChange}>
                    <MenuItem value="true">Sí</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Precio WiFi" name="wifi_cost" value={formData.wifi_cost} onChange={handleChange} disabled={formData.includes_wifi === "false"} />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Contrato"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      {/* Modales */}
      <SelectUserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} onSelect={handleUserSelect} />
      <SelectRoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} onSelect={handleRoomSelect} />
    </AdminLayout>
  );
};

export default CreateContract;
