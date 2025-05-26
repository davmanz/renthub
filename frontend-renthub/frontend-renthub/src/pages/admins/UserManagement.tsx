import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import UserModal from "./modals/UserManagement/CreateUser";
import EditUserModal from "./modals/UserManagement/EditUserModal";
import { UserInterface } from "../../types/types";
import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, IconButton, Switch,
  Snackbar, Alert, TablePagination, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import { ROLES, RoleKey } from "../../constants/roles";
import { Edit, Delete, PersonAdd } from "@mui/icons-material";
import { debounce } from "lodash";

const UserManagement = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserInterface | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.userManagement.user);
      setUsers(response.data);
      setError("");
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver los usuarios");
      } else if (err.response?.status === 401) {
        setError("Sesión expirada. Por favor, vuelve a iniciar sesión");
      } else {
        setError("Error al cargar usuarios. Por favor, intenta de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!userId) return;

    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      showNotification("No se puede eliminar un usuario administrador", "error");
      return;
    }

    try {
      setActionInProgress(userId);
      await api.delete(endpoints.userManagement.userId(userId));
      showNotification("Usuario eliminado correctamente", "success");
      fetchUsers();
    } catch (err) {
      showNotification("Error al eliminar usuario", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (userId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked;
    setActionInProgress(userId);

    try {
      const response = await api.patch(endpoints.userManagement.userId(userId), { is_active: newState });
      if (response.status === 200) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: newState } : u));
        showNotification("Estado actualizado correctamente", "success");
      } else {
        throw new Error("Error en el servidor");
      }
    } catch {
      showNotification("Error al cambiar estado de usuario", "error");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !newState } : u));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEdit = (user: UserInterface) => {
    setUserToEdit(user);
    setOpenEditModal(true);
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ open: true, message, type });
  };

  const debouncedSearch = useMemo(() =>
    debounce((value: string) => setSearch(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return users;

    return users.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [users, search]);

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
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
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
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.first_name || ""} ${user.last_name || ""}`}</TableCell>
                      <TableCell>{user.email || "Sin correo"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={Boolean(user.is_active)}
                          onChange={(event) => handleToggleActive(user.id, event)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell>{ROLES[user.role as RoleKey] || "Sin rol"}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(user)}
                          disabled={actionInProgress === user.id}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(user.id)}
                          disabled={actionInProgress === user.id}
                        >
                          <Delete />
                        </IconButton>
                        {actionInProgress === user.id && (
                          <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Container>

      <UserModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        onUserSaved={fetchUsers} 
        userToEdit={selectedUser} 
      />

      <EditUserModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        user={userToEdit}
        onUserUpdated={fetchUsers}
      />

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>¿Estás seguro que deseas eliminar este usuario permanentemente?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={() => { if (userToDelete) handleDelete(userToDelete); setDeleteDialogOpen(false); }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
