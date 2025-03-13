import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, List, ListItem } from "@mui/material";
import AddReferenceModal from "./AddReferenceModal";

interface ReferenceModalProps {
  open: boolean;
  onClose: () => void;
  references: { id: string; first_name: string; last_name: string; document_number: string }[];
  onSelect: (referenceId: string) => void;
  onReferenceAdded: (newReference: any) => void; // 🔥 Se asegura de pasar la referencia agregada al padre
}

const ReferenceModal = ({ open, onClose, references, onSelect, onReferenceAdded }: ReferenceModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddReferenceModal, setOpenAddReferenceModal] = useState(false);

  // Filtra las referencias según el texto ingresado en el buscador
  const filteredReferences = references.filter(
    (ref) =>
      ref.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.document_number.includes(searchQuery)
  );

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Seleccionar Referencia</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Buscar por nombre o número de documento"
            variant="outlined"
            margin="dense"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filteredReferences.length > 0 ? (
            <List>
              {filteredReferences.map((ref) => (
                <ListItem key={ref.id}>
                  <Button fullWidth onClick={() => onSelect(ref.id)}>
                    {ref.first_name} {ref.last_name} - {ref.document_number}
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ mt: 2 }}>No hay referencias disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={() => setOpenAddReferenceModal(true)} variant="contained" color="secondary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <AddReferenceModal
        open={openAddReferenceModal}
        onClose={() => setOpenAddReferenceModal(false)}
        onReferenceAdded={(newReference) => {
          console.log("Referencia añadida desde AddReferenceModal:", newReference);
          onReferenceAdded(newReference);
          setOpenAddReferenceModal(false);
        }}
      />
    </>
  );
};

export default ReferenceModal;
