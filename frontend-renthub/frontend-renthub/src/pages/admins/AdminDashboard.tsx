import AdminLayout from "./AdminLayout";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [proposal, setProposal] = useState({ proposed_date: "", proposed_time_slot: "" });
  const [rejectionComment, setRejectionComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.admin);
        setData(response.data);
      } catch (error: any) {
        console.error("Error al obtener el dashboard del administrador", error);
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (bookingId: string) => {
    await api.post(`${endpoints.laundryBookings}/${bookingId}/approve`);
    window.location.reload();
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    await api.post(`${endpoints.laundryBookings}/${selectedBooking.id}/reject`, { admin_comment: rejectionComment });
    setOpenModal(false);
    window.location.reload();
  };

  const handlePropose = async () => {
    if (!selectedBooking) return;
    await api.post(`${endpoints.laundryBookings}/${selectedBooking.id}/propose`, proposal);
    setOpenModal(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <AdminLayout>
        <CircularProgress />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error">{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 3, mb: 2, color: "#1976d2" }}>
          Gestión de Reservas de Lavandería
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white" }}>Horario</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.washing_payments?.map((booking: any) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.contract__user__first_name} {booking.contract__user__last_name}</TableCell>
                  <TableCell>{booking.month_paid}</TableCell>
                  <TableCell>{booking.payment_date}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>
                    {booking.status === "pending" && (
                      <>
                        <Button variant="contained" color="success" onClick={() => handleApprove(booking.id)}>Aprobar</Button>
                        <Button variant="contained" color="warning" onClick={() => { setSelectedBooking(booking); setOpenModal(true); }}>Proponer</Button>
                        <Button variant="contained" color="error" onClick={() => { setSelectedBooking(booking); setOpenModal(true); }}>Rechazar</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal para rechazo o propuesta */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Paper sx={{ padding: 4, maxWidth: 400, margin: "auto", mt: 5 }}>
            {selectedBooking && (
              <>
                <Typography variant="h6">Gestión de Reserva</Typography>
                {selectedBooking.status === "pending" ? (
                  <>
                    <Typography variant="body1">Proponer un nuevo horario:</Typography>
                    <TextField fullWidth label="Nueva Fecha" type="date" value={proposal.proposed_date} onChange={(e) => setProposal({ ...proposal, proposed_date: e.target.value })} sx={{ mt: 2 }} />
                    <TextField fullWidth label="Nuevo Horario" value={proposal.proposed_time_slot} onChange={(e) => setProposal({ ...proposal, proposed_time_slot: e.target.value })} sx={{ mt: 2 }} />
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handlePropose}>Enviar Propuesta</Button>
                  </>
                ) : (
                  <>
                    <Typography variant="body1">Motivo del rechazo:</Typography>
                    <TextField fullWidth multiline rows={3} value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} sx={{ mt: 2 }} />
                    <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={handleReject}>Rechazar</Button>
                  </>
                )}
              </>
            )}
          </Paper>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
