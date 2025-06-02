import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import CreateContractModal from "./modals/ContractManagement/CreateContractModal";
import EditContractModal from "./modals/ContractManagement/EditContractModal";
import {
  Container, Paper, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, IconButton, Chip,
} from "@mui/material";
import { Edit, Delete, LibraryAdd } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { Contract } from "../../types/types";

const ContractManagement = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await api.get(endpoints.contractManagement.contracts);
      setContracts(response.data);
    } catch (err) {
      setError("Error al cargar contratos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este contrato?")) return;
    try {
      await api.delete(`${endpoints.contractManagement.contracts}${contractId}/`);
      fetchContracts();
    } catch (err) {
      console.error("Error al eliminar contrato:", err);
    }
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setOpenEditModal(true);
  };

  const handleCreateNew = () => {
    setSelectedContract(null);
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setSelectedContract(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedContract(null);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Gestión de Contratos
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<LibraryAdd />}
          onClick={handleCreateNew}
          sx={{ mb: 2 }}
        >
          Agregar Contrato
        </Button>

        <TextField
          fullWidth
          label="Buscar contrato"
          variant="outlined"
          margin="normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                <TableCell sx={{ color: "white" }}>Habitación</TableCell>
                <TableCell sx={{ color: "white" }}>Monto</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts
                .filter((contract) =>
                  contract.user_full_name.toLowerCase().includes(search.toLowerCase())
                )
                .map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.user_full_name}</TableCell>
                    <TableCell>{contract.building_name} - {contract.room_number}</TableCell>
                    <TableCell>{contract.rent_amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={contract.is_overdue ? "Vencido" : "Vigente"} 
                        color={contract.is_overdue ? "error" : "success"} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(contract)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(contract.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Modal de Creación */}
      <CreateContractModal 
        open={openCreateModal} 
        onClose={handleCloseCreateModal} 
        onContractSaved={fetchContracts} 
      />

      {/* Modal de Edición */}
      <EditContractModal 
        open={openEditModal} 
        onClose={handleCloseEditModal} 
        contract={selectedContract}
        onContractUpdated={fetchContracts} 
      />
    </AdminLayout>
  );
};

export default ContractManagement;