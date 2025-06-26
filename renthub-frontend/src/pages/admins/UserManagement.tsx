import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import CreateUser from "./modals/UserManagement/CreateUser";
import EditUserModal from "./modals/UserManagement/EditUserModal";
import { UserInterface } from "../../types/types";
import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, IconButton, Switch,
  Snackbar, Alert, TablePagination, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tabs, Tab, Chip
} from "@mui/material";
import { ROLES, RoleKey } from "../../constants/roles";
import { Edit, Delete, PersonAdd, Email, DeleteForever, LockOpen, Clear } from "@mui/icons-material";
import { debounce } from "lodash";

// Interfaz para usuarios bloqueados
interface BlockedUser {
  user: {
    id: string;
    email: string;
    name: string;
    ip: string;
  };
}

// Subcomponente para usuarios no verificados
const UnverifiedUsersSection = ({ 
  users, 
  onResendEmail, 
  onDeleteUnverified, 
  actionInProgress 
}: {
  users: UserInterface[];
  onResendEmail: (userId: string) => void;
  onDeleteUnverified: (userId: string) => void;
  actionInProgress: string | null;
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const unverifiedUsers = users.filter(user => !user.is_verified);

  if (unverifiedUsers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No hay usuarios pendientes de verificación
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f57c00" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Nombre</TableCell>
              <TableCell sx={{ color: "white" }}>Email</TableCell>
              <TableCell sx={{ color: "white" }}>Fecha de registro</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unverifiedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.first_name || ""} ${user.last_name || ""}`}</TableCell>
                <TableCell>{user.email || "Sin correo"}</TableCell>
                <TableCell>
                  {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <Chip 
                    label="No verificado" 
                    color="warning" 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => onResendEmail(user.id)}
                    disabled={actionInProgress === user.id}
                    title="Reenviar correo de verificación"
                  >
                    <Email />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => onDeleteUnverified(user.id)}
                    disabled={actionInProgress === user.id}
                    title="Eliminar usuario no verificado"
                  >
                    <DeleteForever />
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
        count={unverifiedUsers.length}
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
  );
};

// Nuevo subcomponente para usuarios bloqueados
const BlockedUsersSection = ({ 
  blockedUsers, 
  onUnlockUser, 
  actionInProgress 
}: {
  blockedUsers: BlockedUser[];
  onUnlockUser: (userId: string) => void;
  actionInProgress: string | null;
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (blockedUsers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No hay usuarios bloqueados
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#d32f2f" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Nombre</TableCell>
              <TableCell sx={{ color: "white" }}>Email</TableCell>
              <TableCell sx={{ color: "white" }}>IP</TableCell>
              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blockedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((blockedUser) => (
              <TableRow key={blockedUser.user.id}>
                <TableCell>{blockedUser.user.name}</TableCell>
                <TableCell>{blockedUser.user.email}</TableCell>
                <TableCell>{blockedUser.user.ip}</TableCell>
                <TableCell>
                  <Chip 
                    label="Bloqueado" 
                    color="error" 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="success"
                    onClick={() => onUnlockUser(blockedUser.user.id)}
                    disabled={actionInProgress === blockedUser.user.id}
                    title="Desbloquear usuario"
                  >
                    <LockOpen />
                  </IconButton>
                  {actionInProgress === blockedUser.user.id && (
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
        count={blockedUsers.length}
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
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [verifiedPage, setVerifiedPage] = useState(0);
  const [verifiedRowsPerPage, setVerifiedRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserInterface | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchBlockedUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.userManagement.user);
      setUsers(response.data);
      setError("");
    } catch (err: any) {
      let errorMessage = "Error al cargar usuarios";
      
      if (err.response?.status === 403) {
        errorMessage = "No tienes permisos para ver los usuarios";
      } else if (err.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, vuelve a iniciar sesión";
      } else if (!err.response) {
        errorMessage = "Error de conexión. Verifica tu conexión a internet";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get(endpoints.userManagement.userBlokes);
      setBlockedUsers(response.data);
    } catch (err: any) {
      console.error("Error al cargar usuarios bloqueados:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!userId) return;

    const userToDelete = users.find(u => u.id === userId);
    
    // Validaciones mejoradas
    if (!userToDelete) {
      showNotification("Usuario no encontrado", "error");
      return;
    }
    
    if (userToDelete.role === 'admin') {
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

  // Nuevas funciones para usuarios no verificados
  const handleResendEmail = async (userId: string) => {
    try {
      setActionInProgress(userId);
      await api.post(endpoints.userManagement.resendVerification(userId));
      showNotification("Correo de verificación reenviado correctamente", "success");
    } catch (err: any) {
      let errorMessage = "Error al reenviar correo de verificación";
      
      if (err.response?.status === 503 && err.response?.data?.code === "gmail_token_error") {
        errorMessage = "Error de configuración del servidor de correo. Contacte al administrador del sistema.";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUnverified = async (userId: string) => {
    try {
      setActionInProgress(userId);
      await api.delete(endpoints.userManagement.userId(userId));
      showNotification("Usuario no verificado eliminado correctamente", "success");
      fetchUsers();
    } catch (err) {
      showNotification("Error al eliminar usuario no verificado", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  // Nueva función para desbloquear usuarios
  const handleUnlockUser = async (userId: string) => {
    try {
      setActionInProgress(userId);
      await api.patch(endpoints.userManagement.unlockUser(userId));
      showNotification("Usuario desbloqueado correctamente", "success");
      fetchBlockedUsers(); // Refrescar la lista de usuarios bloqueados
    } catch (err: any) {
      let errorMessage = "Error al desbloquear usuario";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      showNotification(errorMessage, "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();
    let baseUsers = users;
    
    // Si estamos en la pestaña de verificados, filtrar solo verificados
    if (activeTab === 0) {
      baseUsers = users.filter(user => user.is_verified);
    }
    
    if (!searchTerm) return baseUsers;

    return baseUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [users, search, activeTab]);

  const unverifiedCount = users.filter(user => !user.is_verified).length;
  const verifiedCount = users.filter(user => user.is_verified).length;
  const blockedCount = blockedUsers.length;

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    setSearch(""); // Limpiar búsqueda al cambiar tab
    debouncedSearch.cancel(); // Cancelar búsqueda pendiente
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
          onClick={() => { setOpenModal(true); }}
          sx={{ mb: 2 }}
        >
          Agregar Usuario
        </Button>

        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => handleTabChange(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Verificados
                <Chip label={verifiedCount} size="small" color="success" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pendientes
                <Chip label={unverifiedCount} size="small" color="warning" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Bloqueados
                <Chip label={blockedCount} size="small" color="error" />
              </Box>
            } 
          />
        </Tabs>

        {activeTab === 0 && (
          <TextField
            fullWidth
            label="Buscar usuario verificado"
            variant="outlined"
            margin="normal"
            value={search} // Agregar value para control completo
            onChange={(e) => debouncedSearch(e.target.value)}
            InputProps={{
              endAdornment: search && (
                <IconButton onClick={() => { setSearch(""); debouncedSearch(""); }}>
                  <Clear />
                </IconButton>
              )
            }}
          />
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {activeTab === 0 ? (
              // Tabla de usuarios verificados (código existente)
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
                      {filteredUsers.slice(verifiedPage * verifiedRowsPerPage, verifiedPage * verifiedRowsPerPage + verifiedRowsPerPage).map((user) => (
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
                  page={verifiedPage}
                  onPageChange={(_, newPage) => setVerifiedPage(newPage)}
                  rowsPerPage={verifiedRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setVerifiedRowsPerPage(parseInt(e.target.value, 10));
                    setVerifiedPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            ) : activeTab === 1 ? (
              // Sección de usuarios no verificados
              <UnverifiedUsersSection
                users={users}
                onResendEmail={handleResendEmail}
                onDeleteUnverified={handleDeleteUnverified}
                actionInProgress={actionInProgress}
              />
            ) : (
              // Nueva sección de usuarios bloqueados
              <BlockedUsersSection
                blockedUsers={blockedUsers}
                onUnlockUser={handleUnlockUser}
                actionInProgress={actionInProgress}
              />
            )}
          </>
        )}
      </Container>

      <CreateUser 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        onUserSaved={fetchUsers} 
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
