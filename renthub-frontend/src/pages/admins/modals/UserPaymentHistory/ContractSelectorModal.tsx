import { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Chip, TextField, Box, Select, MenuItem,
  FormControl, Tooltip, Pagination, Skeleton
} from "@mui/material";
import { History } from "@mui/icons-material";
import api from "../../../../api/api";
import endpoints from "../../../../api/endpoints";
import ContractPaymentHistory from "./ContractPaymentHistoryModal";

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
}

interface Contract {
  id: string;
  room_number: string;
  building_name: string;
  rent_amount: string;
  is_overdue: boolean;
}

const ContractSelector = ({ userId, open, onClose }: Props) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<"building_name" | "room_number">("building_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    api.get(endpoints.contractManagement.contractsByUser(userId))
      .then((res) => setContracts(res.data))
      .catch((err) => console.error("Error al cargar contratos", err))
      .finally(() => setLoading(false));
  }, [userId, open]);

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.room_number.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "overdue" && contract.is_overdue) ||
      (filterStatus === "active" && !contract.is_overdue);
    return matchesSearch && matchesStatus;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const valA = a[sortField].toString();
    const valB = b[sortField].toString();
    return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const paginatedContracts = sortedContracts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (field: "building_name" | "room_number") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Contratos del Usuario</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <TextField
              placeholder="Buscar edificio o habitación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
            />
            <FormControl size="small">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Vigentes</MenuItem>
                <MenuItem value="overdue">Vencidos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <>
              {[1, 2, 3].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={40} sx={{ my: 1 }} />
              ))}
            </>
          ) : sortedContracts.length === 0 ? (
            <Typography>No hay contratos asociados a este usuario.</Typography>
          ) : (
            <>
              <Table component={Paper}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleSort("building_name")}
                    >
                      Edificio {sortField === "building_name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableCell>
                    <TableCell
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleSort("room_number")}
                    >
                      Habitación {sortField === "room_number" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.building_name}</TableCell>
                      <TableCell>{contract.room_number}</TableCell>
                      <TableCell>S/. {contract.rent_amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={contract.is_overdue ? "Vencido" : "Vigente"}
                          color={contract.is_overdue ? "error" : "success"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver historial de pagos">
                          <IconButton
                            color="primary"
                            onClick={() => setSelectedContractId(contract.id)}
                            aria-label="ver historial de pagos"
                          >
                            <History />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                count={Math.ceil(sortedContracts.length / rowsPerPage)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                sx={{ mt: 2, display: "flex", justifyContent: "center" }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {selectedContractId && (
        <ContractPaymentHistory
          contractId={selectedContractId}
          open={Boolean(selectedContractId)}
          onClose={() => setSelectedContractId(null)}
        />
      )}
    </>
  );
};

export default ContractSelector;
