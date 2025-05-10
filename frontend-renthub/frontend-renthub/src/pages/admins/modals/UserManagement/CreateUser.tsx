import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, Alert
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import ReferenceModal from "./ReferenceModal";
import {UserFormData, Reference, Props} from "../../../../types/types"
import { validateUserForm } from "../../../../components/utils/UsersValidation";

const CreateUser = ({ open, onClose, onUserSaved, userToEdit }: Props) => {
  const [formData, setFormData] = useState<UserFormData>({
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
  const [availableReferences, setAvailableReferences] = useState<Reference[]>([]);
  const [selectedReferenceField, setSelectedReferenceField] = useState<string | null>(null);
  const [openReferenceModal, setOpenReferenceModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    const fetchInitialData = async () => {
      try {
        const [docTypes, refs] = await Promise.all([
          api.get(endpoints.userManagement.documentTypes),
          api.get(endpoints.userManagement.referencePerson),
        ]);
        setDocumentTypes(docTypes.data);
        setAvailableReferences(refs.data);
      } catch (err) {
        console.error("Error al obtener tipos de documento o referencias", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.references_count < 1) {
      setFormData(prev => ({ ...prev, reference_1: "", reference_2: "" }));
    } else if (formData.references_count === 1) {
      setFormData(prev => ({ ...prev, reference_2: "" }));
    }
  }, [formData.references_count]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const validationErrors = validateUserForm(formData, !!userToEdit);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (userToEdit) {
        await api.put(`${endpoints.userManagement.user}${userToEdit.id}/`, formData);
      } else {
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

  const handleReferenceSelection = (field: string) => {
    setSelectedReferenceField(field);
    setOpenReferenceModal(true);
  };

  const handleReferenceAdded = (newRef: Reference) => {
    setAvailableReferences(prev => [...prev, newRef]);
  };

  const selectReference = (id: string) => {
    if (selectedReferenceField) {
      setFormData(prev => ({ ...prev, [selectedReferenceField]: id }));
      setOpenReferenceModal(false);
    }
  };

  const getReferenceLabel = (id: string) => {
    const ref = availableReferences.find(r => r.id === id);
    return ref ? `${ref.first_name} ${ref.last_name}` : "Referencia no encontrada";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{userToEdit ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Nombre" name="first_name" value={formData.first_name} onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name} />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required={!userToEdit} error={!!errors.password} helperText={errors.password} />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select name="document_type_id" value={formData.document_type_id} onChange={handleChange} error={!!errors.document_type_id}>
                {documentTypes.map((doc: any) => (
                  <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>
                ))}
              </Select>
              {errors.document_type_id && <Alert severity="error">{errors.document_type_id}</Alert>}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Número de Documento" name="document_number" value={formData.document_number} onChange={handleChange} error={!!errors.document_number} helperText={errors.document_number} />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cantidad de Referencias</InputLabel>
              <Select name="references_count" value={formData.references_count.toString()} onChange={handleChange}>
                <MenuItem value="0">Ninguna</MenuItem>
                <MenuItem value="1">1 Referencia</MenuItem>
                <MenuItem value="2">2 Referencias</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.references_count > 0 && (
            <Grid item xs={12}>
              <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_1")}>
                {formData.reference_1 ? getReferenceLabel(formData.reference_1) : "Seleccionar Referencia 1"}
              </Button>
              {errors.reference_1 && <Alert severity="error">{errors.reference_1}</Alert>}
            </Grid>
          )}

          {formData.references_count > 1 && (
            <Grid item xs={12}>
              <Button fullWidth variant="outlined" onClick={() => handleReferenceSelection("reference_2")}>
                {formData.reference_2 ? getReferenceLabel(formData.reference_2) : "Seleccionar Referencia 2"}
              </Button>
              {errors.reference_2 && <Alert severity="error">{errors.reference_2}</Alert>}
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

      <ReferenceModal
        open={openReferenceModal}
        onClose={() => setOpenReferenceModal(false)}
        references={availableReferences}
        onSelect={selectReference}
        onReferenceAdded={handleReferenceAdded}
      />
    </Dialog>
  );
};

export default CreateUser;
