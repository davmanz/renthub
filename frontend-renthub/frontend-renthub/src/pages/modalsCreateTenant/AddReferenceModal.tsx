import { useState, useEffect } from "react";
import { 
    Dialog,
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Alert, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel 
} from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

interface AddReferenceModalProps {
  open: boolean;
  onClose: () => void;
  onReferenceAdded: (newReference: any) => void;
}

const AddReferenceModal = ({ open, onClose, onReferenceAdded }: AddReferenceModalProps) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    document_number: "",
    phone_number: "",
    document_type: "",
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await api.get(endpoints.createUsers.documentTypes);
        setDocumentTypes(response.data);
      } catch (err) {
        console.error("Error al obtener los tipos de documento", err);
      }
    };

    fetchDocumentTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value as string });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {        
        const response = await api.post(endpoints.createUsers.referencePerson, formData);

        if (response.status === 201) {
            
            // 🔥 Verificación antes de llamar a la función
            if (typeof onReferenceAdded === "function") {
                onReferenceAdded(response.data); // Agregar la nueva referencia a la lista
            } else {
                console.error("⚠️ Error: `onReferenceAdded` no es una función.");
            }

            // Limpiar formulario
            setFormData({
                first_name: "",
                last_name: "",
                document_number: "",
                phone_number: "",
                document_type: "",
            });

            setError(""); // Asegurar que no quede error
            alert("Referencia creada con éxito!");
            onClose(); // Cerrar modal después de crear la referencia
        } else {
            setError("⚠️ Error inesperado en la respuesta del servidor.");
        }
    } catch (err) {
        setError("❌ Error al crear la referencia. Verifica los datos.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Nueva Referencia</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField fullWidth label="Nombre" name="first_name" value={formData.first_name} onChange={handleChange} margin="dense" required />
        <TextField fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} margin="dense" required />
        
        {/* Selector para el tipo de documento */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Tipo de Documento</InputLabel>
          <Select name="document_type" value={formData.document_type} onChange={handleChange} required>
            {documentTypes.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField fullWidth label="Número de Documento" name="document_number" value={formData.document_number} onChange={handleChange} margin="dense" required />
        <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} margin="dense" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReferenceModal;
