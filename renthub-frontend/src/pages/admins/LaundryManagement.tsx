import { useEffect, useState, } from "react";
import AdminLayout from "./AdminLayout";
import {
  Container, Typography, Paper, TableContainer, CircularProgress, Alert
} from "@mui/material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import LaundryRequestsTable from "../../components/utils/LaundryRequestsTable";
import RescheduleLaundryModal from "./modals/LaundryManagement/RescheduleLaundryModal";
import {RejectionModal} from "../../components/shared/RejectionModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RejectionReasonModal from "./modals/LaundryManagement/RejectionReasonModal";
import { LaundryBooking } from "../../types/types";

const LaundryManagement = () => {
  const [requests, setRequests] = useState<LaundryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LaundryBooking | null>(null);

  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.laundryManagement.list);
      setRequests(response.data);
    } catch (err) {
      setError("Error al cargar solicitudes de lavandería");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await api.post(endpoints.laundryManagement.approve(requestId));
      fetchRequests();
    } catch (error) {
      console.error("Error al aprobar la solicitud:", error);
    }
  };

  const handleReject = (request: LaundryBooking) => {
    setSelectedRequest(request);
    setOpenRejectModal(true);
  };

  const handleReschedule = (request: LaundryBooking) => {
    setSelectedRequest(request);
    setOpenRescheduleModal(true);
  };

  const handleViewVoucher = (request: LaundryBooking) => {
    setSelectedRequest(request);
    setOpenVoucherModal(true);
  };

  const handleViewRejectionReason = (request: LaundryBooking) => {
    setSelectedRequest(request);
    setOpenRejectionReasonModal(true);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>
          Solicitudes de Lavandería
        </Typography>

        {loading && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && requests.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No hay solicitudes de lavandería pendientes
          </Alert>
        )}

        {!loading && !error && requests.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <LaundryRequestsTable
              requests={requests}
              onAccept={handleAccept}
              onReject={handleReject}
              onReschedule={handleReschedule}
              onViewVoucher={handleViewVoucher}
              onViewRejectionReason={handleViewRejectionReason}
            />
          </TableContainer>
        )}
      </Container>

      <ViewVoucherModal
        open={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        voucherImage={selectedRequest?.voucher_image_url || ""}
        userComment={selectedRequest?.user_comment || undefined}
      />

      <RejectionModal
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        rejectUrl={`/laundry-bookings/${selectedRequest?.id}/reject/`}
        onSuccess={() => {
          fetchRequests();
          setOpenRejectModal(false);
        }}
        title="Rechazo de Lavandería"
      />  
      <RescheduleLaundryModal 
        open={openRescheduleModal} 
        onClose={() => setOpenRescheduleModal(false)} 
        booking={selectedRequest} 
        fetchBookings={fetchRequests} 
      />

      <RejectionReasonModal 
        open={openRejectionReasonModal} 
        onClose={() => setOpenRejectionReasonModal(false)} 
        request={selectedRequest} 
      />

    </AdminLayout>
  );
};

export default LaundryManagement;
