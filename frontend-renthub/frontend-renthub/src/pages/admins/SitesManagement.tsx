import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import AdminLayout from "./AdminLayout";
import CreateBuildingModal from "./modals/Sites/CreateBuildingModal";
import CreateRoomModal from "./modals/Sites/CreateRoomModal";
import EditBuildingModal from "./modals/Sites/EditBuildingModal";
import {
  Container, Paper, Typography, Button, IconButton, Chip, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Breadcrumbs, Link, Tooltip, CircularProgress, Snackbar, TextField,
  TablePagination, Grid
} from "@mui/material";
import { Edit, Add, Lock, LockOpen } from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

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
  const [editBuildingModal, setEditBuildingModal] = useState<{open: boolean, building: Building | null}>({
    open: false,
    building: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async (buildingId: string) => {
    try {
      const response = await api.get(endpoints.siteManagement.buildingRooms(buildingId));
      setRooms(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: "Error al obtener habitaciones", severity: "error" });
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

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) =>
      r.room_number.toString().includes(search)
    );
  }, [rooms, search]);

  const stats = useMemo(() => ({
    total: rooms.length,
    occupied: rooms.filter(r => r.is_occupied).length,
    available: rooms.filter(r => !r.is_occupied).length
  }), [rooms]);

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
                <TableRow
                  key={building.id}
                  onClick={() => handleBuildingClick(building)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedBuilding?.id === building.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                    }
                  }}
                >
                  <TableCell>{building.name}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar edificio" arrow>
                      <IconButton 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditBuildingModal({ open: true, building });
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
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
          sx={{ mb: 3 }}
        >
          Agregar Edificio
        </Button>

        {selectedBuilding && (
          <Box>
            <Typography variant="h5" sx={{ mt: 3 }}>
              Habitaciones de {selectedBuilding.name}
            </Typography>

            <Grid container spacing={2} sx={{ my: 2 }}>
              <Grid item><Chip label={`Total: ${stats.total}`} /></Grid>
              <Grid item><Chip label={`Ocupadas: ${stats.occupied}`} color="error" /></Grid>
              <Grid item><Chip label={`Disponibles: ${stats.available}`} color="success" /></Grid>
            </Grid>

            <TextField
              fullWidth
              placeholder="Buscar habitación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "#1976d2" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white" }}>Número de Habitación</TableCell>
                    <TableCell sx={{ color: "white" }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRooms
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>{room.room_number}</TableCell>
                        <TableCell>
                          <Chip
                            label={room.is_occupied ? "Ocupada" : "Disponible"}
                            color={room.is_occupied ? "error" : "success"}
                            variant="outlined"
                            icon={room.is_occupied ? <Lock /> : <LockOpen />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRooms.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ mt: 2 }}
            />

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

        {selectedBuilding && (
          <CreateRoomModal
            open={roomModalOpen}
            onClose={() => setRoomModalOpen(false)}
            building={selectedBuilding}
            refreshRooms={() => fetchRooms(selectedBuilding.id)}
          />
        )}

        <EditBuildingModal
          open={editBuildingModal.open}
          onClose={() => setEditBuildingModal({ open: false, building: null })}
          building={editBuildingModal.building}
          refreshBuildings={fetchBuildings}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default SitesManagement;
