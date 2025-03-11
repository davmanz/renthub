import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

interface CreateReferenceModalProps {
  open: boolean;
  onClose: () => void;
  onReferenceCreated: (newReference: any) => void;
}

const CreateReferenceModal: React.FC<CreateReferenceModalProps> = ({ open, onClose, onReferenceCreated }) => {
  const [newReference, setNewReference] = useState({ first_name: "", last_name: "" });
  const [loading, setLoading] = useState(false);

  const handleCreateReference = async () => {
    try {
      setLoading(true);
      const response = await api.post(endpoints.createUsers.createReference, newReference);
      onReferenceCreated(response.data); // Enviar la nueva referencia al componente padre
      onClose();
    } catch (err) {
      console.error("Error al crear referencia", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Nueva Referencia</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nombre"
          value={newReference.first_name}
          onChange={(e) => setNewReference({ ...newReference, first_name: e.target.value })}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Apellido"
          value={newReference.last_name}
          onChange={(e) => setNewReference({ ...newReference, last_name: e.target.value })}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleCreateReference} variant="contained" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReferenceModal;
