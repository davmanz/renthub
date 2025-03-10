import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import endpoints from "../api/endpoints";
import AdminLayout from "./AdminLayout";
import ReferenceModal from "./ReferenceModal";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Alert,
  Grid,
  SelectChangeEvent,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Reference, DocumentType } from "../types/types";

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
    reference_1: "",
    reference_2: "",
    references_count: 0
  });

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [availableReferences, setAvailableReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedReferenceField, setSelectedReferenceField] = useState<"reference_1" | "reference_2" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener tipos de documento
        const docResponse = await api.get(endpoints.createUsers.documentTypes);
        setDocumentTypes(docResponse.data);

        // Obtener referencias de la API
        const refResponse = await api.get(endpoints.createUsers.referencePerson);
        setAvailableReferences(refResponse.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.references_count < 1) {
      setFormData((prev) => ({ ...prev, reference_1: "", reference_2: "" }));
    } else if (formData.references_count === 1) {
      setFormData((prev) => ({ ...prev, reference_2: "" })); // Limpia reference_2 si solo se necesita una referencia
    }
  }, [formData.references_count]);

  // ✅ Función para agregar referencias al estado sin recargar la página
  const handleReferenceAdded = (newReference: Reference) => {
    setAvailableReferences((prev) => [...prev, newReference]); // 🔥 Actualiza las referencias en tiempo real
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { references_count, ...dataToSend } = formData;  // Elimina references_count
      console.log("Enviando datos:", dataToSend); // Debug en consola
  
      await api.post(endpoints.createUsers.createUser, dataToSend);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/admin"), 2000);
    } catch (err) {
      setError("Error al crear el usuario. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceSelection = (field: "reference_1" | "reference_2") => {
    setSelectedReferenceField(field);
    setOpenModal(true);
  };

  const selectReference = (referenceId: string) => {
    if (selectedReferenceField) {
      setFormData({
        ...formData,
        [selectedReferenceField]: referenceId,  // ✅ Guarda el UUID correctamente
      });
      setOpenModal(false);
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
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Nombre" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Correo Electrónico" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} required />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Tipo de Documento" name="document_type" select value={formData.document_type} onChange={handleChange}>
                  {documentTypes.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Número de Documento" name="document_number" value={formData.document_number} onChange={handleChange} required />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cantidad de Referencias</InputLabel>
                  <Select
                    name="references_count"
                    value={String(formData.references_count)}  
                    onChange={handleSelectChange}>
                    <MenuItem value="0">Ninguna</MenuItem>
                    <MenuItem value="1">1 Referencia</MenuItem>
                    <MenuItem value="2">2 Referencias</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.references_count >= 1 && (
                <>
                  <Grid item xs={12}>
                    <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_1")}>
                      Seleccionar Referencia 1
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referencia 1"
                    value={availableReferences.find(ref => ref.id === formData.reference_1)?.first_name + " " +
                          availableReferences.find(ref => ref.id === formData.reference_1)?.last_name || ""}
                    disabled
                  />
                  </Grid>
                </>
              )}

              {formData.references_count >= 2 && (  // Aquí el cambio es >= 2 en lugar de === 2
                <>
                  <Grid item xs={12}>
                    <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_2")}>
                      Seleccionar Referencia 2
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referencia 2"
                    value={availableReferences.find(ref => ref.id === formData.reference_2)?.first_name + " " +
                          availableReferences.find(ref => ref.id === formData.reference_2)?.last_name || ""}
                    disabled
                  />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button 
                  type="submit"
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  disabled={loading} // Para evitar envíos múltiples
                >
                  {loading ? "Guardando..." : "Guardar Datos"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* ✅ Aquí pasamos la función para actualizar referencias en tiempo real */}
        <ReferenceModal 
          open={openModal} 
          onClose={() => setOpenModal(false)} 
          references={availableReferences} 
          onSelect={selectReference} 
          onReferenceAdded={handleReferenceAdded} // 🔥 Se asegura de actualizar referencias
        />
      </Container>
    </AdminLayout>
  );
};

export default CreateTenant;
