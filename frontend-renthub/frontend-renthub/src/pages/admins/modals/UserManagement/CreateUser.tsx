import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import ReferenceModal from "./ReferenceModal";

const CreateUser = ({ open, onClose, onUserSaved, userToEdit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    document_type_id: "",
    document_number: "",
    role: "tenant",
    reference_1: "",
    reference_2: "",
    references_count: 0,
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [availableReferences, setAvailableReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openReferenceModal, setOpenReferenceModal] = useState(false);
  const [selectedReferenceField, setSelectedReferenceField] = useState(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData(userToEdit);
    } else {
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        document_type_id: "",
        document_number: "",
        role: "tenant",
        reference_1: "",
        reference_2: "",
        references_count: 0,
      });
    }
  }, [userToEdit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docResponse = await api.get(endpoints.userManagement.documentTypes);
        setDocumentTypes(docResponse.data);

        const refResponse = await api.get(endpoints.userManagement.referencePerson);
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
      setFormData((prev) => ({ ...prev, reference_2: "" }));
    }
  }, [formData.references_count]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReferenceSelection = (field) => {
    setSelectedReferenceField(field);
    setOpenReferenceModal(true);
  };

  const selectReference = (referenceId) => {
    if (selectedReferenceField) {
      setFormData({
        ...formData,
        [selectedReferenceField]: referenceId,
      });
      setOpenReferenceModal(false);
    }
  };

  const handleReferenceAdded = (newReference) => {
    setAvailableReferences((prev) => [...prev, newReference]); // Agrega la referencia a la lista localmente
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (userToEdit) {
        console.log(formData);
        await api.put(`${endpoints.userManagement.user}${userToEdit.id}/`, formData);
      } else {
        console.log(formData);
        await api.post(endpoints.userManagement.user, formData);
      }
      onUserSaved();
      onClose();
    } catch (err) {
      console.error("Error al guardar usuario", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{userToEdit ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
      <DialogContent>
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
            <TextField fullWidth label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select name="document_type_id" value={formData.document_type_id} onChange={handleChange}>
                {documentTypes.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Número de Documento" name="document_number" value={formData.document_number} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cantidad de Referencias</InputLabel>
              <Select name="references_count" value={String(formData.references_count)} onChange={handleChange}>
                <MenuItem value="0">Ninguna</MenuItem>
                <MenuItem value="1">1 Referencia</MenuItem>
                <MenuItem value="2">2 Referencias</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.references_count > 0 && (
            <Grid item xs={12}>
              <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_1")}>
                Seleccionar Referencia 1
              </Button>
            </Grid>
          )}

          {formData.references_count > 1 && (
            <Grid item xs={12}>
              <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_2")}>
                Seleccionar Referencia 2
              </Button>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : userToEdit ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>

      <ReferenceModal open={openReferenceModal} onClose={() => setOpenReferenceModal(false)} references={availableReferences} onSelect={selectReference} onReferenceAdded={handleReferenceAdded} />
    </Dialog>
  );
};

export default CreateUser;
