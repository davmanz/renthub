import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import {
  Home,
  CalendarToday,
  AttachMoney,
  Wifi,
  Security,
  Warning,
  CheckCircle,
  Payment,
  Visibility,
} from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import UploadPaymentModal from "./modals/ContractInfo/UploadPaymentModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RejectReasonModal from "../../components/shared/RejectReasonModal"; // ✅ Nueva ruta
import { Contract } from "../../types/types";
import { DateUtil } from '../../components/utils/DateUtil';

const ContractInfo = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [viewVoucherOpen, setViewVoucherOpen] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false); // ✅

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
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Home sx={{ color: "#90caf9" }} /> {selectedContract.building_name} - Habitación {selectedContract.room_number}
                </Typography>
              </Grid>

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

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Wifi sx={{ color: selectedContract.includes_wifi ? "#42a5f5" : "gray" }} />
                  <strong>WiFi:</strong> {selectedContract.includes_wifi ? "Incluido" : "No incluido"}
                </Typography>
                {selectedContract.includes_wifi && (
                  <Chip label={`Costo WiFi: $${selectedContract.wifi_cost}`} color="primary" sx={{ mt: 1 }} />
                )}
              </Grid>

              {selectedContract.is_overdue && selectedContract.next_month && (
                <Grid item xs={12} sx={{ textAlign: "center", mt: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Mes a pagar: <strong>
                      {DateUtil.getMonthAndYear(selectedContract.next_month.payment)}
                    </strong>
                  </Typography>

                  {selectedContract.next_month.voucher && selectedContract.next_month.admin_comment ? (
                    <>
                      <Chip label="Pago rechazado" color="error" sx={{ mb: 2 }} />
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setOpenRejectModal(true)}
                        >
                          Ver motivo del rechazo
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Payment />}
                          onClick={() => setOpenModal(true)}
                        >
                          Subir nuevo comprobante
                        </Button>
                      </Box>
                    </>
                  ) : selectedContract.next_month.voucher ? (
                    <>
                      <Chip
                        label="Pago pendiente por aprobación"
                        color="warning"
                        icon={<Warning />}
                        sx={{ fontSize: 16, fontWeight: "bold", mb: 1 }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<Visibility />}
                          onClick={() => setViewVoucherOpen(true)}
                        >
                          Ver Comprobante
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Payment />}
                      onClick={() => setOpenModal(true)}
                    >
                      Subir Comprobante
                    </Button>
                  )}
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* MODALES */}
      {selectedContract?.next_month?.payment && (
        <UploadPaymentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          nextPaymentMonth={selectedContract.next_month.payment}
          paymentId={selectedContract.next_month.id}
        />
      )}

      {selectedContract?.next_month?.voucher && (
        <ViewVoucherModal
          open={viewVoucherOpen}
          onClose={() => setViewVoucherOpen(false)}
          voucherImage={selectedContract.next_month.voucher}
        />
      )}

      {selectedContract?.next_month?.admin_comment && (
        <RejectReasonModal
          open={openRejectModal}
          booking={{
            admin_comment: selectedContract.next_month.admin_comment,
            voucher_image: selectedContract.next_month.voucher,
          }}
          handleClose={() => setOpenRejectModal(false)}
        />
      )}
    </Paper>
  );
};

export default ContractInfo;
