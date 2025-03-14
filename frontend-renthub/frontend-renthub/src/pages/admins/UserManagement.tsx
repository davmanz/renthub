import { useState, useEffect } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import UserModal from "./modals/UserManagement/CreateUser";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Switch,
} from "@mui/material";
import { Edit, Delete, PersonAdd } from "@mui/icons-material";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(endpoints.userManagement.user);
      setUsers(response.data);
    } catch (err) {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario permanentemente?")) return;
    await api.delete(`${endpoints.userManagement.user}/${userId}`);
    fetchUsers();
  };

  const handleToggleActive = async (userId, isActive) => {
    await api.patch(`${endpoints.userManagement.user}/${userId}`, { active: !isActive });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Gestión de Usuarios
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={() => { setSelectedUser(null); setOpenModal(true); }}
          sx={{ mb: 2 }}
        >
          Agregar Usuario
        </Button>

        <TextField
          fullWidth
          label="Buscar usuario"
          variant="outlined"
          margin="normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Nombre</TableCell>
                <TableCell sx={{ color: "white" }}>Email</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Rol</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter((user) =>
                  user.first_name.toLowerCase().includes(search.toLowerCase()) ||
                  user.email.toLowerCase().includes(search.toLowerCase())
                )
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id, user.active)}
                        color="success"
                      />
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Modal de Creación y Edición de Usuario */}
      <UserModal open={openModal} onClose={() => setOpenModal(false)} onUserSaved={fetchUsers} userToEdit={selectedUser} />
    </AdminLayout>
  );
};

export default UserManagement;
