import { useState, useEffect } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import UserModal from "./modals/UserManagement/CreateUser";
import { User } from "../../types/types";
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
  const [users, setUsers] = useState<User[]>([]);
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
    await api.delete(`${endpoints.userManagement.user}${userId}`);
    fetchUsers();
  };

  const handleToggleActive = async (userId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked; // Nuevo estado según el click en el switch
  
    // Actualizar el estado localmente antes de la llamada a la API
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, is_active: newState } : user
      )
    );
  
    try {
      const response = await api.patch(endpoints.userManagement.userId(userId), { is_active: newState });
  
      if (response.status !== 200) {
        throw new Error(`Error en la API: ${response.status}`);
      }
  
      // No llamamos a fetchUsers() para evitar sobrescribir el cambio local
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
  
      // Si la API falla, revertimos el cambio
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_active: !newState } : user
        )
      );
    }
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
                      checked={Boolean(user.is_active)}
                      onChange={(event) => handleToggleActive(user.id, event)}
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
