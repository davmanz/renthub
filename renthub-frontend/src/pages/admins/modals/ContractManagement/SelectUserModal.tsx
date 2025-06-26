import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, Button, ListItemButton, ListItemText
} from "@mui/material";
import { UserInterface } from "../../../../types/types"; // Assuming User type is defined in types/types.ts

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (user: UserInterface) => void;
}

const SelectUserModal = ({ open, onClose, onSelect }: Props) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(endpoints.userManagement.user)
      .then(response => setUsers(response.data))
      .catch(console.error);
  }, []);

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(search.toLowerCase()) ||
    user.last_name.toLowerCase().includes(search.toLowerCase()) ||
    user.document_number.includes(search)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleccionar Usuario</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Buscar por nombre o documento"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          margin="dense"
        />
        <List>
          {filteredUsers.map(user => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={() => onSelect(user)}>
                <ListItemText primary={`${user.first_name} ${user.last_name} - ${user.document_number}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate("/dashboard/admin/create-tenant")}>
          Crear Usuario Tenant
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectUserModal;
