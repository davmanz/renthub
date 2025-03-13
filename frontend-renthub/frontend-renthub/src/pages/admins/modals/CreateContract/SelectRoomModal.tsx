import { useState, useEffect } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, DialogActions, Button, MenuItem, Select } from "@mui/material";

const SelectRoomModal = ({ open, onClose, onSelect }) => {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(endpoints.createSites.building)
      .then(response => setBuildings(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      setSelectedRoom(null);  // Limpiar selección de room si cambia el building
      setRooms([]);  // Limpiar habitaciones antes de la nueva carga
      api.get(`${endpoints.createContract.rommsAvaible}?building_id=${selectedBuilding}`)
        .then(response => setRooms(response.data))
        .catch(console.error);
    }
  }, [selectedBuilding]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    onSelect(room.id);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Seleccionar Habitación</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>Seleccionar Building</MenuItem>
          {buildings.map(building => (
            <MenuItem key={building.id} value={building.id}>
              {building.name}
            </MenuItem>
          ))}
        </Select>

        {selectedBuilding && (
          <>
            <TextField
              fullWidth
              label="Buscar habitación"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              margin="dense"
            />
            <List>
              {rooms
                .filter(room => room.room_number.includes(search))
                .map(room => (
                  <ListItem
                    key={room.id}
                    button
                    selected={selectedRoom?.id === room.id}
                    onClick={() => handleRoomSelect(room)}
                  >
                    Habitación {room.room_number}
                  </ListItem>
                ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectRoomModal;
