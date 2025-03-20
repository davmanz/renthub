import { useEffect, useState } from "react";
import { Typography, Paper, CircularProgress, Alert, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid, Divider, Chip } from "@mui/material";
import { Home, CalendarToday, AttachMoney, Wifi, Security, Warning, CheckCircle, Payment } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import UploadPaymentModal from "./modals/ContractInfo/UploadPaymentModal";
import { Contract } from "../../types/types";

const ContractInfo = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false); // Estado para el modal de pago

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get(endpoints.contractManagement.contracts);
        setContracts(response.data);
        setSelectedContract(response.data.length > 0 ? response.data[0] : null);
      } catch (error) {
        setError("Error al cargar los datos del contrato.");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 4, bgcolor: "#2c2c2c", color: "white", borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center", color: "#90caf9" }}>
        Información del Contrato
      </Typography>

      {contracts.length > 1 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: "white" }}>Selecciona un contrato</InputLabel>
          <Select
            value={selectedContract?.id || ""}
            onChange={(e) => setSelectedContract(contracts.find(c => c.id === e.target.value))}
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
        <Card sx={{ bgcolor: "#424242", color: "white", borderRadius: 2, p: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              {/* Edificio y Habitación */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Home sx={{ color: "#90caf9" }} /> {selectedContract.building_name} - Habitación {selectedContract.room_number}
                </Typography>
              </Grid>

              {/* Estado del Pago */}
              <Grid item xs={12} sx={{ textAlign: "center", mt: 1 }}>
                {selectedContract.is_overdue ? (
                  <Chip
                    label="Pendiente de Pago"
                    icon={<Warning />}
                    color="error"
                    sx={{ fontSize: 16, fontWeight: "bold", px: 2 }}
                  />
                ) : (
                  <Chip
                    label="Pagos al Día"
                    icon={<CheckCircle />}
                    color="success"
                    sx={{ fontSize: 16, fontWeight: "bold", px: 2 }}
                  />
                )}
              </Grid>

              <Divider sx={{ width: "100%", my: 2, bgcolor: "gray" }} />

              {/* Fechas */}
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ color: "#ffb74d" }} /> <strong>Inicio:</strong> {selectedContract.start_date}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ color: "#ff7043" }} /> <strong>Fin:</strong> {selectedContract.end_date}
                </Typography>
              </Grid>

              <Divider sx={{ width: "100%", my: 2, bgcolor: "gray" }} />

              {/* Monto de renta y depósito */}
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachMoney sx={{ color: "#66bb6a" }} /> <strong>Renta:</strong> ${selectedContract.rent_amount}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security sx={{ color: "#fdd835" }} /> <strong>Depósito:</strong> ${selectedContract.deposit_amount}
                </Typography>
              </Grid>

              {/* WiFi */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Wifi sx={{ color: selectedContract.includes_wifi ? "#42a5f5" : "gray" }} />
                  <strong>WiFi:</strong> {selectedContract.includes_wifi ? "Incluido" : "No incluido"}
                </Typography>
                {selectedContract.includes_wifi && (
                  <Chip label={`Costo WiFi: $${selectedContract.wifi_cost}`} color="primary" sx={{ mt: 1 }} />
                )}
              </Grid>

              {/* Botón de Pago si el contrato está vencido */}
              {selectedContract.is_overdue && (
                <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Payment />}
                    onClick={() => setOpenModal(true)}
                  >
                    Realizar Pago
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Modal para subir comprobante de pago */}
      {selectedContract && (
        <UploadPaymentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          nextPayment={selectedContract.end_date} // Suponiendo que se paga al final del contrato
        />
      )}
    </Paper>
  );
};

export default ContractInfo;
