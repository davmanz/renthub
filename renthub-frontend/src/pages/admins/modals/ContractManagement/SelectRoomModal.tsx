import { useState, useEffect } from "react";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  List, ListItem, Button, MenuItem, Select, InputLabel, FormControl,
  Alert, CircularProgress,ListItemButton, ListItemText
} from "@mui/material";
import { Building, Room } from "../../../../types/types";

//interface Building { id: string; name: string;}

//interface Room { id: string;room_number: string;}

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
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(endpoints.siteManagement.building)
      .then((response) => setBuildings(response.data))
      .catch((err) => {
        console.error("Error al cargar edificios:", err);
        setError("Error al cargar los edificios.");
      });
  }, []);

  useEffect(() => {
    if (selectedBuilding) {

      setRooms([]);
      setLoadingRooms(true);
      api
        .get(endpoints.contractManagement.roomsAvailable(selectedBuilding))
        .then((response) => {
          setRooms(response.data);
          setError("");
        })
        .catch((err) => {
          console.error("Error al cargar habitaciones:", err);
          setError("No se pudieron cargar las habitaciones disponibles.");
        })
        .finally(() => setLoadingRooms(false));
    }
  }, [selectedBuilding]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleccionar Habitación</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <FormControl fullWidth margin="dense">
          <InputLabel>Edificio</InputLabel>
          <Select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            label="Edificio"
          >
            {buildings.map((building) => (
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

            {loadingRooms ? (
              <CircularProgress sx={{ mt: 2 }} />
            ) : (
              <List>
                {rooms
                  .filter((room) =>
                    room.room_number !== undefined &&
                    String(room.room_number).includes(search)
                  )
                  .map((room) => (
                    <ListItem key={room.id} disablePadding>
                      <ListItemButton onClick={() => onSelect(room)}>
                        <ListItemText primary={`Habitación ${room.room_number}`} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                {rooms.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Sin habitaciones disponibles." />
                  </ListItem>
                )}
              </List>
            )}
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