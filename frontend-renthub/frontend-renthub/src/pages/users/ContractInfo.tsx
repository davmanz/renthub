import { useState } from "react";
import { Typography, Paper, 
  CircularProgress, Alert, 
  FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useContracts } from "./modals/ContractInfo/useContracts";
import ContractDetails from "./modals/ContractInfo/ContractDetails";
import ContractModals from "./modals/ContractInfo//ContracsModals";
import { contractStyles } from "./modals/ContractInfo/contractStyles";

const ContractInfo = () => {
  const { contracts, loading, error } = useContracts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedContract = contracts.find((c) => c.id === selectedId) || contracts[0];

  const [modalStates, setModalStates] = useState({
    uploadPayment: false,
    viewVoucher: false,
    rejectReason: false,
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={contractStyles.paper}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center", color: "#90caf9" }}>
        Información del Contrato
      </Typography>

      {contracts.length > 1 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "white" }}>Selecciona un contrato</InputLabel>
          <Select
            value={selectedContract?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            sx={{ bgcolor: "#424242", color: "white", borderRadius: 2 }}
          >
            {contracts.map((contract) => (
              <MenuItem key={contract.id} value={contract.id}>
                {contract.building_name} - Habitación {contract.room_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedContract && (
        <>
          <ContractDetails
            contract={selectedContract}
            modalStates={modalStates}
            setModalStates={setModalStates}
          />
          <ContractModals
            contract={selectedContract}
            modalStates={modalStates}
            setModalStates={setModalStates}
          />
        </>
      )}
    </Paper>
  );
};

export default ContractInfo;
