import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { LaundryBooking } from "../../types/types";
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
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Check, Close, Schedule, Visibility, Info } from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import RescheduleLaundryModal from "./modals/LaundryManagement/RescheduleLaundryModal";
import RejectLaundryModal from "./modals/LaundryManagement/RejectLaundryModal";
import ViewVoucherModal from "./modals/LaundryManagement/ViewVoucherModal";
import RejectionReasonModal from "./modals/LaundryManagement/RejectionReasonModal";


const LaundryManagement = () => {
  const [requests, setRequests] = useState<LaundryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LaundryBooking | null>(null);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get(endpoints.laundryManagement.list);
      console.log(response.data);
      setRequests(response.data);
    } catch (err) {
      setError("Error al cargar solicitudes de lavandería");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await api.post(endpoints.laundryManagement.approve(requestId));
      fetchRequests();
    } catch (error) {
      console.error("Error al aprobar la solicitud:", error);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Solicitudes de Lavandería
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white" }}>Hora</TableCell>
                <TableCell sx={{ color: "white" }}>Estado</TableCell>
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request: LaundryBooking) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user_full_name}</TableCell>
                  <TableCell>
                    {request.status === "counter_proposal"
                      ? request.counter_proposal_date
                      : request.status === "proposed"
                      ? request.proposed_date
                      : request.date}
                  </TableCell>

                  <TableCell>
                    {request.status === "counter_proposal"
                      ? request.counter_proposal_time_slot
                      : request.status === "proposed"
                      ? request.proposed_time_slot
                      : request.time_slot}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        request.status === "approved"
                          ? "Aprobado"
                          : request.status === "rejected"
                          ? "Rechazado"
                          : request.pending_action === "admin"
                          ? "Pendiente Adm"
                          : "Pendiente Usr"
                      }
                      color={
                        request.status === "approved"
                          ? "success"
                          : request.status === "rejected"
                          ? "error"
                          : request.pending_action === "admin"
                          ? "warning"
                          : "info"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver comprobante">
                      <IconButton color="primary" onClick={() => { setSelectedRequest(request); setOpenVoucherModal(true); }}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {request.pending_action === "admin" && (
                      <>
                        <Tooltip title="Aprobar solicitud">
                          <IconButton color="success" onClick={() => handleAccept(request.id)}>
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rechazar solicitud">
                          <IconButton color="error" onClick={() => { setSelectedRequest(request); setOpenRejectModal(true); }}>
                            <Close />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Proponer nueva fecha">
                          <IconButton color="warning" onClick={() => { setSelectedRequest(request); setOpenRescheduleModal(true); }}>
                            <Schedule />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {request.status === "rejected" && request.admin_comment && (
                      <Tooltip title="Ver motivo de rechazo">
                        <IconButton color="info" onClick={() => { setSelectedRequest(request); setOpenRejectionReasonModal(true); }}>
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
      </Container>

      {/* Modales */}
      <ViewVoucherModal open={openVoucherModal} onClose={() => setOpenVoucherModal(false)} request={selectedRequest} />
      <RejectLaundryModal open={openRejectModal} onClose={() => setOpenRejectModal(false)} request={selectedRequest} onReject={fetchRequests} />
      <RescheduleLaundryModal open={openRescheduleModal} onClose={() => setOpenRescheduleModal(false)} request={selectedRequest} onReschedule={fetchRequests} />
      <RejectionReasonModal open={openRejectionReasonModal} onClose={() => setOpenRejectionReasonModal(false)} request={selectedRequest} />
    </AdminLayout>
  );
};

export default LaundryManagement;
