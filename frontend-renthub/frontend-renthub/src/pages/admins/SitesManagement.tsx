import { useState, useEffect } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import CreateBuildingModal from "./modals/Sites/CreateBuildingModal";
import CreateRoomModal from "./modals/Sites/CreateRoomModal";
import {
  Container, Paper, Typography, Button, IconButton, Chip, Box, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Alert, Breadcrumbs, Link, Tooltip, CircularProgress,
} from "@mui/material";
import { Edit, Add, Lock, LockOpen } from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import InboxIcon from "@mui/icons-material/Inbox";

interface Building {
  id: string;
  name: string;
}

interface Room {
  id: number;
  room_number: string;
  is_occupied: boolean;
}

const SitesManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get(endpoints.siteManagement.building);
      setBuildings(response.data);
    } catch (error) {
      setError("Error al obtener los edificios.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async (buildingId: string) => {
    try {
      const response = await api.get(endpoints.siteManagement.buildingRooms(buildingId));
      setRooms(response.data);
    } catch (error) {
      console.error("Error al obtener rooms", error);
    }
  };

  const handleBuildingClick = (building: Building) => {
    if (selectedBuilding?.id === building.id) {
      setSelectedBuilding(null);
      setRooms([]);
    } else {
      setSelectedBuilding(building);
      fetchRooms(building.id);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link color="inherit" href="/dashboard/admin">Dashboard</Link>
          <Typography color="text.primary">Gestión de Edificios</Typography>
          {selectedBuilding && <Typography color="text.primary">{selectedBuilding.name}</Typography>}
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Gestión de Edificios y Habitaciones
        </Typography>

        {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {buildings.length === 0 && !isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <InboxIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">No hay edificios registrados todavía</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setBuildingModalOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar primer edificio
            </Button>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              mb: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: 2,
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: '0 8px'
              }
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Edificio</TableCell>
                  <TableCell sx={{ color: "white" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buildings.map((building) => (
                  <TableRow
                    key={building.id}
                    onClick={() => handleBuildingClick(building)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedBuilding?.id === building.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    <TableCell>{building.name}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar edificio" arrow placement="top">
                        <IconButton color="primary" onClick={() => handleBuildingClick(building)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setBuildingModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Agregar Edificio
        </Button>

        {selectedBuilding && (
          <Box
            sx={{
              animation: 'fadeIn 0.3s ease-in-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography variant="h5" sx={{ mt: 3 }}>
              Habitaciones de {selectedBuilding.name}
            </Typography>

            {rooms.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No hay habitaciones registradas para este edificio
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  mt: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  '& .MuiTable-root': {
                    borderCollapse: 'separate',
                    borderSpacing: '0 8px'
                  }
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white" }}>Número de Habitación</TableCell>
                      <TableCell sx={{ color: "white" }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>{room.room_number}</TableCell>
                        <TableCell>
                          <Chip
                            label={room.is_occupied ? "Ocupada" : "Disponible"}
                            color={room.is_occupied ? "error" : "success"}
                            variant="outlined"
                            icon={room.is_occupied ? <Lock /> : <LockOpen />}
                            sx={{
                              '& .MuiChip-label': { fontWeight: 500 },
                              minWidth: 100,
                              justifyContent: 'center'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() => setRoomModalOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Habitación
            </Button>
          </Box>
        )}

        <CreateBuildingModal
          open={buildingModalOpen}
          onClose={() => setBuildingModalOpen(false)}
          refreshBuildings={fetchBuildings}
        />

        <CreateRoomModal
          open={roomModalOpen && selectedBuilding !== null}
          onClose={() => setRoomModalOpen(false)}
          building={selectedBuilding!}
          refreshRooms={() => selectedBuilding && fetchRooms(selectedBuilding.id)}
        />
      </Container>
    </AdminLayout>
  );
};

export default SitesManagement;
