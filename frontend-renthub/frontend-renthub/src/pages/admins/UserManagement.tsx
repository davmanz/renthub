import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import UserModal from "./modals/UserManagement/CreateUser";
import EditUserModal from "./modals/UserManagement/EditUserModal";
import { User } from "../../types/types";
import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, IconButton, Switch,
  Snackbar, Alert, TablePagination, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import { Edit, Delete, PersonAdd } from "@mui/icons-material";
import { debounce } from "lodash";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

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

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`${endpoints.userManagement.user}${userId}/`);
      showNotification("Usuario eliminado correctamente", "success");
      fetchUsers();
    } catch {
      showNotification("Error al eliminar usuario", "error");
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (userId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked;
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: newState } : u));
    try {
      const response = await api.patch(endpoints.userManagement.userId(userId), { is_active: newState });
      if (response.status !== 200) throw new Error("Error en el servidor");
    } catch {
      showNotification("Error al cambiar estado de usuario", "error");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !newState } : u));
    }
  };

  const handleEdit = (user: User) => {
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

  const filteredUsers = useMemo(() =>
    users.filter((user) =>
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

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
                      <TableCell>{user.role || "Sin rol"}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEdit(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(user.id)}>
                          <Delete />
                        </IconButton>
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
              onPageChange={(e, newPage) => setPage(newPage)}
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
