import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import endpoints from "../api/endpoints";
import AdminLayout from "./AdminLayout";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

const CreateTenant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    document_type: "",
    document_number: "",
    role: "tenant",
    is_active: true,
    reference_1: "",
    reference_2: "",
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await api.get(endpoints.createUsers.documentTypes);
        console.log("Tipos de documento recibidos:", response.data);
        setDocumentTypes(response.data);
      } catch (err) {
        console.error("Error al obtener los tipos de documento", err);
      }
    };
  
    fetchDocumentTypes();
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key as keyof typeof formData] as string);
      });

    /*

      // Agregar archivos al FormData
      Object.keys(files).forEach((key) => {
        const file = files[key as keyof typeof files];
        if (file) {
          formDataToSend.append(key, file);
        }
      });
    
    */
      await api.post(endpoints.createUsers.createUser, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/dashboard/admin"), 2000); // Redirigir tras éxito
    } catch (err) {
      setError("Error al crear el usuario. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 3, mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Crear Nuevo Usuario Tenant
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>

            <TextField fullWidth label="Nombre" name="first_name" value={formData.first_name} onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Correo Electrónico" type="email" name="email" value={formData.email} onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Tipo de Documento" name="document_type" select value={formData.document_type} onChange={handleChange} margin="normal">
              {documentTypes.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField fullWidth label="Número de Documento" name="document_number" value={formData.document_number} onChange={handleChange} margin="normal" required />

            {/* Campos de referencia */}
            <TextField fullWidth label="Referencia 1" name="reference_1" value={formData.reference_1} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Referencia 2" name="reference_2" value={formData.reference_2} onChange={handleChange} margin="normal" />

            <Button type="submit" variant="contained" fullWidth color="primary" sx={{ mt: 3 }} disabled={loading}>
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </form>
        </Paper>

        {/* Notificación de éxito */}
        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
          <Alert severity="success">Usuario creado exitosamente</Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default CreateTenant;
