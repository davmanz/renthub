import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, Button } from "@mui/material";

const SelectUserModal = ({ open, onClose, onSelect }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(endpoints.createContract.users).then(response => setUsers(response.data)).catch(console.error);
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Seleccionar Usuario</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Buscar usuario" value={search} onChange={(e) => setSearch(e.target.value)} />
        <List>
          {users.filter(user => user.first_name.includes(search) || user.document_number.includes(search))
            .map(user => (
              <ListItem key={user.id} button onClick={() => onSelect(user.id)}>
                {user.first_name} {user.last_name} - {user.document_number}
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate("/dashboard/admin/create-tenant")}>Crear Usuario Tenant</Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectUserModal;
