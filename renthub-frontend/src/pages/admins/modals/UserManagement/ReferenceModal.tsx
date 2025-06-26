import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  List,
  ListItem,
  Box
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddReferenceModal from "./AddReferenceModal";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import {ReferencePerson} from ".././../../../types/types"



interface ReferenceModalProps {
  open: boolean;
  onClose: () => void;
  references: ReferencePerson[];
  onSelect: (referenceId: string) => void;
  onReferenceAdded: (newReference: ReferencePerson) => void;
}

const ReferenceModal = ({
  open,
  onClose,
  references,
  onSelect,
  onReferenceAdded
}: ReferenceModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddReferenceModal, setOpenAddReferenceModal] = useState(false);

  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.length >= 3 || query.length === 0) {
      handleSearch(query);
    }
  };

  const filteredReferences = useMemo(() => {
    return references.filter(
      (ref) =>
        ref.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.document.number.includes(searchQuery)
    );
  }, [references, searchQuery]);

  const handleSelect = (referenceId: string) => {
    onSelect(referenceId);
    toast.success("Referencia seleccionada correctamente");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Seleccionar Referencia 001</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Buscar por nombre o documento"
            variant="outlined"
            margin="dense"
            onChange={handleInputChange}
            placeholder="Ej: Juan Pérez o 12345678"
            slotProps={{
            input: {
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }
            }}
          />

          {filteredReferences.length > 0 ? (
            <List sx={{ mt: 2 }}>
              {filteredReferences.map((ref) => (
                <ListItem
                  key={ref.id}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5"
                    }
                  }}
                >
                  <Button fullWidth onClick={() => handleSelect(ref.id)}>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="subtitle1">
                        {ref.first_name} {ref.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ref.document.name}: {ref.document.number}
                      </Typography>
                    </Box>
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : searchQuery ? (
            <Typography sx={{ mt: 2, textAlign: "center" }}>
              No se encontraron referencias para "{searchQuery}"
            </Typography>
          ) : (
            <Typography sx={{ mt: 2, textAlign: "center" }}>
              No hay referencias disponibles.
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => setOpenAddReferenceModal(true)}
            variant="contained"
            color="secondary"
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <AddReferenceModal
        open={openAddReferenceModal}
        onClose={() => setOpenAddReferenceModal(false)}
        onReferenceAdded={(newReference: ReferencePerson) => {
          onReferenceAdded(newReference);
          setOpenAddReferenceModal(false);
        }}
      />
    </>
  );
};

export default ReferenceModal;
