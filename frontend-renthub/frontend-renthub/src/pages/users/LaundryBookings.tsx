import { useEffect, useState } from "react";
import {
  Typography, Paper, CircularProgress, Alert, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Box
} from "@mui/material";
import { Close, Schedule, Visibility, Check, Info, Add } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

import RejectReasonModal from "../../components/shared/RejectReasonModal";
import RescheduleModal from "../../components/utils/RescheduleModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import ReserveModal from "./modals/LaundryBookings/ReserveModal";

const LaundryBookings = () => {
  const [laundryBookings, setLaundryBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openReserveModal, setOpenReserveModal] = useState(false);

  const fetchLaundryBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(endpoints.laundryManagement.list);
      setLaundryBookings(response.data);
    } catch (err) {
      setError("Error al cargar las reservas de lavandería.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaundryBookings();
  }, []);

  const handleAcceptProposal = async (bookingId: string) => {
    try {
      await api.post(endpoints.laundryManagement.acceptProposal(bookingId));
      fetchLaundryBookings();
    } catch {
      setError("Error al aceptar la propuesta.");
    }
  };

  return (
    <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white" }}>
      <Typography variant="h5">Mis Reservas de Lavandería</Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => setOpenReserveModal(true)}
        sx={{ mb: 2 }}
      >
        Crear Reserva
      </Button>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && laundryBookings.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white" }}>Horario</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {laundryBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {booking.status === "counter_proposal"
                      ? booking.counter_proposal_date
                      : booking.status === "proposed"
                      ? booking.proposed_date
                      : booking.date}
                  </TableCell>

                  <TableCell>
                    {booking.status === "counter_proposal"
                      ? booking.counter_proposal_time_slot
                      : booking.status === "proposed"
                      ? booking.proposed_time_slot
                      : booking.time_slot}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        booking.status === "approved"
                          ? "Aprobado"
                          : booking.status === "rejected"
                          ? "Rechazado"
                          : booking.pending_action === "admin"
                          ? "Pendiente Adm"
                          : "Pendiente Usr"
                      }
                      color={
                        booking.status === "approved"
                          ? "success"
                          : booking.status === "rejected"
                          ? "error"
                          : booking.pending_action === "admin"
                          ? "warning"
                          : "info"
                      }
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    {booking.pending_action === "user" && (
                      <>
                        <Tooltip title="Cancelar reserva">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setOpenRejectModal(true);
                            }}
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>

                        {(booking.status === "counter_proposal" || booking.status === "proposed") && (
                          <Tooltip title="Aceptar propuesta del administrador">
                            <IconButton
                              color="success"
                              onClick={() => handleAcceptProposal(booking.id)}
                            >
                              <Check />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Proponer nueva fecha">
                          <IconButton
                            color="warning"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setOpenRescheduleModal(true);
                            }}
                          >
                            <Schedule />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {booking.status === "approved" && (
                      <Tooltip title="Ver comprobante">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setOpenVoucherModal(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}

                    {booking.status === "rejected" && booking.admin_comment && (
                      <Tooltip title="Ver motivo de rechazo">
                        <IconButton
                          color="info"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setOpenRejectModal(true);
                          }}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !loading && <Typography sx={{ mt: 2 }}>No tienes reservas activas.</Typography>
      )}

      {/* MODALES */}
      <ReserveModal
        open={openReserveModal}
        handleClose={() => setOpenReserveModal(false)}
        onSuccess={fetchLaundryBookings}
      />

      <ViewVoucherModal
        open={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        voucherImage={selectedBooking?.voucher_image_url || ""}
        userComment={selectedBooking?.user_comment}
      />

      <RescheduleModal
        open={openRescheduleModal}
        booking={selectedBooking}
        fetchBookings={fetchLaundryBookings}
        handleClose={() => setOpenRescheduleModal(false)}
      />

      <RejectReasonModal
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        adminComment={selectedBooking?.admin_comment || ""}
        voucherImage={selectedBooking?.voucher_image_url}
      />
    </Paper>
  );
};

export default LaundryBookings;
