import { useState, useEffect } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";
import AdminLayout from "./AdminLayout";
import CreateBuildingModal from "./modalsSites/CreateBuildingModal";
import CreateRoomModal from "./modalsSites/CreateRoomModal";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  Grid
} from "@mui/material";

const Sites = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchBuilding, setSearchBuilding] = useState("");
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
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Gestión de Buildings y Rooms
        </Typography>

        <Grid container spacing={2}>
          {/* 🔹 Sección de Buildings */}
          <Grid item xs={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">Buildings</Typography>
              <TextField
                fullWidth
                label="Buscar Building"
                variant="outlined"
                margin="dense"
                value={searchBuilding}
                onChange={(e) => setSearchBuilding(e.target.value)}
              />
              <List>
                {buildings
                  .filter((b) => b.name.toLowerCase().includes(searchBuilding.toLowerCase()))
                  .map((building) => (
                    <ListItem key={building.id} button onClick={() => handleBuildingClick(building)}>
                      {building.name}
                    </ListItem>
                  ))}
              </List>
              <Button fullWidth variant="contained" color="primary" onClick={() => setBuildingModalOpen(true)}>
                Agregar Building
              </Button>
            </Paper>
          </Grid>

          {/* 🔹 Sección de Rooms */}
          <Grid item xs={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">Rooms en {selectedBuilding ? selectedBuilding.name : "..."}</Typography>
              {selectedBuilding ? (
                <>
                  <List>
                    {rooms.map((room) => (
                      <ListItem key={room.id}>{room.room_number}</ListItem>
                    ))}
                  </List>
                  <Button fullWidth variant="contained" color="secondary" onClick={() => setRoomModalOpen(true)}>
                    Agregar Room
                  </Button>
                </>
              ) : (
                <Typography variant="body2">Selecciona un Building para ver sus Rooms.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Modales */}
        <CreateBuildingModal open={buildingModalOpen} onClose={() => setBuildingModalOpen(false)} refreshBuildings={fetchBuildings} />
        <CreateRoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} building={selectedBuilding} refreshRooms={() => fetchRooms(selectedBuilding.id)} />
      </Container>
    </AdminLayout>
  );
};

export default Sites;
