import { useState, useEffect } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import CreateBuildingModal from "./modals/Sites/CreateBuildingModal";
import CreateRoomModal from "./modals/Sites/CreateRoomModal";
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
  IconButton,
  Chip,
} from "@mui/material";
import { Edit, Add } from "@mui/icons-material";

const SitesManagement = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await api.get(endpoints.createSites.building);
      setBuildings(response.data);
    } catch (error) {
      console.error("Error al obtener buildings", error);
    }
  };

  const fetchRooms = async (buildingId) => {
    try {
      const response = await api.get(`${endpoints.createSites.rooms_id}=${buildingId}`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error al obtener rooms", error);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    fetchRooms(building.id);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Gestión de Edificios y Habitaciones
        </Typography>

        {/* Tabla de Edificios */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Edificio</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buildings.map((building) => (
                <TableRow key={building.id} onClick={() => handleBuildingClick(building)}>
                  <TableCell>{building.name}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleBuildingClick(building)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setBuildingModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Agregar Edificio
        </Button>

        {/* Tabla de Habitaciones */}
        {selectedBuilding && (
          <>
            <Typography variant="h5" sx={{ mt: 3 }}>
              Habitaciones de {selectedBuilding.name}
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                          label={room.is_available ? "Disponible" : "Ocupada"} 
                          color={room.is_available ? "success" : "error"} 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() => setRoomModalOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Habitación
            </Button>
          </>
        )}

        {/* Modales */}
        <CreateBuildingModal open={buildingModalOpen} onClose={() => setBuildingModalOpen(false)} refreshBuildings={fetchBuildings} />
        <CreateRoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} building={selectedBuilding} refreshRooms={() => fetchRooms(selectedBuilding.id)} />
      </Container>
    </AdminLayout>
  );
};

export default SitesManagement;
