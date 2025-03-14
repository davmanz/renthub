import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import CreateContractModal from "./modals/ContractManagement/CreateContract";
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
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { Edit, Delete, LibraryAdd } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

  const handleDelete = async (contractId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este contrato?")) return;
    await api.delete(`${endpoints.contractManagement.contracts}/${contractId}`);
    fetchContracts();
  };

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setOpenModal(true);
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
          onClick={() => { setSelectedContract(null); setOpenModal(true); }}
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

      <CreateContractModal open={openModal} onClose={() => setOpenModal(false)} onContractSaved={fetchContracts} contractToEdit={selectedContract} />
    </AdminLayout>
  );
};

export default ContractManagement;