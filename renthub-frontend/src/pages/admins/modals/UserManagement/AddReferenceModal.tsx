import { useState, useEffect } from "react";
import { AxiosError } from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, FormControl,
  InputLabel, Tooltip,
} from "@mui/material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { toast } from "react-toastify";

interface AddReferenceModalProps {
  open: boolean;
  onClose: () => void;
  onReferenceAdded: (newReference: any) => void;
}

interface DocumentType {
  id: string;
  name: string;
}

interface ReferenceFormData {
  first_name: string;
  last_name: string;
  document_number: string;
  phone_number: string;
  document_type_id: string;
}

const AddReferenceModal = ({ open, onClose, onReferenceAdded }: AddReferenceModalProps) => {
  const [formData, setFormData] = useState<ReferenceFormData>({
    first_name: "",
    last_name: "",
    document_number: "",
    phone_number: "",
    document_type_id: "",
  });

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await api.get(endpoints.userManagement.documentTypes);
        setDocumentTypes(response.data);
      } catch (err) {
        toast.error("❌ Error al obtener los tipos de documento");
      }
    };

    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    if (!open) {
      setFormData({
        first_name: "",
        last_name: "",
        document_number: "",
        phone_number: "",
        document_type_id: "",
      });
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "document_type" ? String(value) : (value as string),
    }));
  };

  const validateForm = () => {
    const { first_name, last_name, document_number, document_type_id, phone_number } = formData;

    if (!first_name || !last_name || !document_number || !document_type_id) {
      toast.error("❌ Por favor complete todos los campos obligatorios.");
      return false;
    }

    if (document_number.length < 5) {
      toast.warning("⚠️ El número de documento debe tener al menos 5 caracteres.");
      return false;
    }

    if (phone_number && !/^\d{9}$/.test(phone_number)) {
      toast.warning("⚠️ El teléfono debe tener exactamente 9 dígitos.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post(endpoints.userManagement.referencePerson, formData);

      if (response.status === 201) {
        if (typeof onReferenceAdded === "function") {
          onReferenceAdded(response.data);
        }

        setFormData({
          first_name: "",
          last_name: "",
          document_number: "",
          phone_number: "",
          document_type_id: "",
        });

        toast.success("✅ Referencia creada con éxito");
        onClose();
      } else {
        toast.error("⚠️ Error inesperado del servidor.");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{code?: string; detail?: string}>;
      
      if (error.response?.status === 400 && error.response.data) {
        if (error.response.data.code == "110") {
          toast.error("❌ Ya existe una referencia con este número y tipo de documento.");
        } else {
          // Mantener el manejo de otros errores de validación
          const errors = error.response.data.detail;
          toast.error(`❌ No se pudo crear la referencia:\n${errors}`);
        }
      } else {
        toast.error("❌ Error inesperado al crear la referencia.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="reference-modal-title" aria-describedby="reference-modal-description">
      <DialogTitle id="reference-modal-title">Agregar Nueva Referencia</DialogTitle>
      <DialogContent id="reference-modal-description">
        <TextField
          fullWidth
          label="Nombre"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          margin="dense"
          required
          slotProps={{
            input: {
            "aria-label": "Nombre de la referencia",
            "aria-required": "true",}
          }}
        />

        <TextField
          fullWidth
          label="Apellido"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          margin="dense"
          required
          slotProps={{
            input: {
            "aria-label": "Nombre de la referencia",
            "aria-required": "true",}
          }}
        />

        <FormControl fullWidth margin="dense" required>
          <InputLabel id="doc-type-label">Tipo de Documento</InputLabel>
          <Select
            labelId="doc-type-label"
            name="document_type_id"
            value={formData.document_type_id}
            onChange={handleChange}
            inputProps={
              { "aria-label": "Tipo de documento", "aria-required": "true" }
            }
          >
            {documentTypes.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title="Ingrese el número de documento sin guiones ni espacios">
          <TextField
            fullWidth
            label="Número de Documento"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            margin="dense"
            required
          />
        </Tooltip>

        <Tooltip title="Solo 9 dígitos (opcional)">
          <TextField
            fullWidth
            label="Teléfono"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            margin="dense"
          />
        </Tooltip>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Guardando..." : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReferenceModal;
