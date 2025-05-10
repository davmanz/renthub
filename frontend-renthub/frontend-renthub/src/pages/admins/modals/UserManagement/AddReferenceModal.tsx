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
  InputLabel,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";

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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!open) return;
    const fetchDocumentTypes = async () => {
      try {
        const response = await api.get(endpoints.userManagement.documentTypes);
        setDocumentTypes(response.data);
      } catch (err) {
        setError("❌ Error al cargar los tipos de documento.");
      }
    };

    fetchDocumentTypes();
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name!]: value }));
  };

  const validateForm = () => {
    const { first_name, last_name, document_number, document_type } = formData;
    return first_name && last_name && document_number && document_type;
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      document_number: "",
      phone_number: "",
      document_type: "",
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setNotification({ open: true, message: "Todos los campos obligatorios deben estar completos.", severity: "error" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(endpoints.userManagement.referencePerson, formData);

      if (response.status === 201) {
        onReferenceAdded(response.data);
        resetForm();
        setNotification({ open: true, message: "Referencia creada con éxito.", severity: "success" });
        onClose();
      } else {
        setNotification({ open: true, message: "Error inesperado al crear la referencia.", severity: "error" });
      }
    } catch (err) {
      setNotification({ open: true, message: "❌ Error al crear la referencia. Verifica los datos.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Agregar Nueva Referencia</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Nombre"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            margin="dense"
            required
          />

          <TextField
            fullWidth
            label="Apellido"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            margin="dense"
            required
          />

          <FormControl fullWidth margin="dense" required>
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
            >
              {documentTypes.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Número de Documento"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            margin="dense"
            required
          />

          <TextField
            fullWidth
            label="Teléfono"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Guardando..." : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddReferenceModal;
