import { useEffect, useState } from "react";
import { Typography, Paper, CircularProgress, Alert, Box } from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

const ContractInfo = () => {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await api.get(endpoints.contract.userContract);
        setContract(response.data);
      } catch (error) {
        setError("Error al cargar los datos del contrato.");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      <Typography variant="h5">Detalles del Contrato</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><strong>Habitación:</strong> {contract?.room_number}</Typography>
        <Typography><strong>Fecha de inicio:</strong> {contract?.start_date}</Typography>
        <Typography><strong>Fecha de fin:</strong> {contract?.end_date}</Typography>
        <Typography><strong>Monto de renta:</strong> {contract?.rent_amount} USD</Typography>
        <Typography><strong>Depósito:</strong> {contract?.deposit_amount} USD</Typography>
        <Typography><strong>WiFi incluido:</strong> {contract?.includes_wifi ? "Sí" : "No"}</Typography>
        {contract?.includes_wifi && <Typography><strong>Costo de WiFi:</strong> {contract?.wifi_cost} USD</Typography>}
      </Box>
    </Paper>
  );
};

export default ContractInfo;
