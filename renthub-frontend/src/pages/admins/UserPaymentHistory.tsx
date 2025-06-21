import { useState, useEffect, useMemo } from "react";
import {
  Container, Typography, TextField, List, ListItem, ListItemText, Paper,
  Skeleton, InputAdornment, Fade
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { debounce } from "lodash";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import ContractSelector from "./modals/UserPaymentHistory/ContractSelectorModal";
import AdminLayout from "./AdminLayout";
import {UserInterface}from "../../types/types";

const UserPaymentHistory = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoints.userManagement.user);
      setUsers(response.data);
    } catch (err) {
      setError("Error al cargar los usuarios. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce((value: string) => setSearch(value), 300), []);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.document_number.includes(search)
    );
  }, [users, search]);

  const LoadingSkeleton = () => (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      <List>
        {[1, 2, 3, 4].map((item) => (
          <ListItem key={item} sx={{ py: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={60} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <AdminLayout>
      <Fade in={true} timeout={500}>
        <Container
          maxWidth="md"
          sx={{
            mt: 4,
            mb: 4,
            minHeight: "80vh",
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            padding: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              color: "#1976d2",
              fontWeight: 600,
              borderBottom: "2px solid #1976d2",
              paddingBottom: 1,
            }}
          >
            Historial de Pagos por Usuario
          </Typography>

          <TextField
            fullWidth
            label="Buscar usuario por nombre o documento"
            placeholder="Ej: Juan Pérez o 12345678"
            margin="normal"
            variant="outlined"
            onChange={(e) => debouncedSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              mb: 3,
              backgroundColor: "white",
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: "#1976d2",
                },
              },
            }}
          />

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <List>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <ListItem
                      component="div"
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      onMouseEnter={() => setHoveredUserId(user.id)}
                      onMouseLeave={() => setHoveredUserId(null)}
                      sx={{
                        borderBottom: "1px solid #e0e0e0",
                        transition: "all 0.2s ease",
                        cursor: 'pointer', // Añadimos cursor pointer para indicar que es clickeable
                        '&:hover': {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                          transform: "translateX(6px)",
                        },
                        backgroundColor:
                          hoveredUserId === user.id ? "rgba(25, 118, 210, 0.08)" : "transparent",
                        padding: 2,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {user.document_type.name}: {user.document_number}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ justifyContent: "center", py: 4 }}>
                    <Typography color="text.secondary" align="center">
                      No se encontraron usuarios que coincidan con la búsqueda
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          )}

          {selectedUserId && (
            <ContractSelector
              userId={selectedUserId}
              open={Boolean(selectedUserId)}
              onClose={() => setSelectedUserId(null)}
            />
          )}
        </Container>
      </Fade>
    </AdminLayout>
  );
};

export default UserPaymentHistory;
