import { Grid, Typography, Divider, Chip, Card, CardContent, Box, Button } from "@mui/material";
import {
  Home, CalendarToday, AttachMoney, Wifi, Security,
  Warning, CheckCircle, Payment, Visibility
} from "@mui/icons-material";
import { Contract } from "../../../../types/types";
import { DateUtil } from "../../../../components/utils/DateUtil";

interface ModalStates {
  uploadPayment: boolean;
  viewVoucher: boolean;
  rejectReason: boolean;
}

interface Props {
  contract: Contract;
  modalStates: ModalStates;
  setModalStates: (value: Partial<ModalStates>) => void;
}

const ContractStatus = ({ contract }: { contract: Contract }) => (
  <Grid item xs={12} sx={{ textAlign: "center", mt: 1 }}>
    {contract.next_month?.status === "pending_review" ? (
      <Chip
        label="Pago en Revisión"
        icon={<Warning />}
        color="warning"
        sx={{ fontSize: 16, fontWeight: "bold", px: 2 }}
      />
    ) : contract.is_overdue ? (
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
);

const ContractDetails = ({ contract, modalStates, setModalStates }: Props) => {
  const next = contract.next_month;

  const handleModalStateChange = (key: keyof ModalStates, value: boolean) => {
    setModalStates({ ...modalStates, [key]: value });
  };

  return (
    <Card sx={{ bgcolor: "#424242", color: "white", borderRadius: 2, p: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Home sx={{ color: "#90caf9" }} />
              {contract.building_name} - Habitación {contract.room_number}
            </Typography>
          </Grid>

          <ContractStatus contract={contract} />

          <Divider sx={{ width: "100%", my: 2, bgcolor: "gray" }} />

          <Grid item xs={6}>
            <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ color: "#ffb74d" }} />
              <strong>Inicio:</strong> {contract.start_date}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ color: "#ff7043" }} />
              <strong>Fin:</strong> {contract.end_date}
            </Typography>
          </Grid>

          <Divider sx={{ width: "100%", my: 2, bgcolor: "gray" }} />

          <Grid item xs={6}>
            <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachMoney sx={{ color: "#66bb6a" }} />
              <strong>Renta:</strong> ${contract.rent_amount}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Security sx={{ color: "#fdd835" }} />
              <strong>Depósito:</strong> ${contract.deposit_amount}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Wifi sx={{ color: contract.includes_wifi ? "#42a5f5" : "gray" }} />
              <strong>WiFi:</strong> {contract.includes_wifi ? "Incluido" : "No incluido"}
            </Typography>
            {contract.includes_wifi && (
              <Chip label={`Costo WiFi: $${contract.wifi_cost}`} color="primary" sx={{ mt: 1 }} />
            )}
          </Grid>

          {next && (
            <Grid item xs={12} sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Mes a pagar: <strong>{DateUtil.getMonthAndYear(next.payment)}</strong>
              </Typography>

              {next.status === "overdue" && next.voucher && next.admin_comment && (
                <>
                  <Chip label="Pago rechazado" color="error" sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleModalStateChange("rejectReason", true)}
                    >
                      Ver motivo del rechazo
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Payment />}
                      onClick={() => handleModalStateChange("uploadPayment", true)}
                    >
                      Subir nuevo comprobante
                    </Button>
                  </Box>
                </>
              )}

              {next.status === "pending_review" && next.voucher && (
                <>
                  <Chip
                    label="Pendiente por revisión"
                    icon={<Warning />}
                    color="warning"
                    sx={{ fontSize: 16, fontWeight: "bold", mb: 1 }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Visibility />}
                      onClick={() => handleModalStateChange("viewVoucher", true)}
                    >
                      Ver Comprobante
                    </Button>
                  </Box>
                </>
              )}

              {next.status === "overdue"  && !next.voucher && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Payment />}
                  onClick={() => handleModalStateChange("uploadPayment", true)}
                >
                  Subir Comprobante
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContractDetails;
