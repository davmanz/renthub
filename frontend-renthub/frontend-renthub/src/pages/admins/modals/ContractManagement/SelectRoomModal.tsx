import { useState, useEffect } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, Button, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";

interface Building {
  id: string;
  name: string;
}

interface Room {
  id: string;
  room_number: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (room: Room) => void;
}

const SelectRoomModal = ({ open, onClose, onSelect }: Props) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(endpoints.siteManagement.building)
      .then(response => setBuildings(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      setRooms([]);
      api.get(endpoints.contractManagement.roomsAvailable(selectedBuilding))
        .then(response => setRooms(response.data))
        .catch(console.error);
    }
  }, [selectedBuilding]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleccionar Habitación</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Edificio</InputLabel>
          <Select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            {buildings.map(building => (
              <MenuItem key={building.id} value={building.id}>
                {building.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
                  <ListItem key={room.id} button onClick={() => onSelect(room)}>
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
