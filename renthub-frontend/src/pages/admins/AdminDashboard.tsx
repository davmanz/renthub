import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RescheduleLaundryModal from "./modals/LaundryManagement/RescheduleLaundryModal";
import {RejectionModal} from "../../components/shared/RejectionModal";
import {
  Container, Grid, Card, CardContent, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Paper, IconButton, Chip,
  CircularProgress, Alert, Tooltip, Snackbar
} from "@mui/material";
import { Info, Visibility, Check, Close } from "@mui/icons-material";
import { DashboardData, SnackbarState, Payment, LaundryBooking } from "../../types/types";
import { STATUS_LABELS } from "../../constants/status";

type TabKey = "pays_reject" | "pays_overdue" | "pays_pending_review" | "pending_user" | "pending_admin";

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<TabKey>("pays_reject");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [openVoucher, setOpenVoucher] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openRejectLaundryModal, setOpenRejectLaundryModal] = useState(false);
  const [openRescheduleLaundryModal, setOpenRescheduleLaundryModal] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

   const fetchData = async () => {
      try {
        const response = await api.get(endpoints.dashboard.admin);
        setData(response.data);
      } catch (err) {
        setSnackbar({ open: true, message: "Error al cargar los datos", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(endpoints.payments.approveRent(id));
      //await api.post(`/payments/rent/${id}/approve/`);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rents_pendings: {
            ...prev.rents_pendings,
            pays_pending_review: prev.rents_pendings.pays_pending_review.filter(p => p.id !== id),
          },
        };
      });
      setSnackbar({ open: true, message: "Pago aprobado exitosamente", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Error al aprobar pago", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveLaundry = async (id: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(endpoints.laundryManagement.approve(id));
      //await api.post(`/laundry-bookings/${id}/approve/`);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          washing_pendings: {
            ...prev.washing_pendings,
            pending_admin: prev.washing_pendings.pending_admin.filter(p => p.id !== id)
          }
        };
      });
      setSnackbar({ open: true, message: "Lavado aprobado", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Error al aprobar lavado", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <AdminLayout><Container sx={{ textAlign: "center", mt: 8 }}><CircularProgress /></Container></AdminLayout>;
  if (!data) return <AdminLayout><Container><Alert severity="error">No se pudo cargar el dashboard.</Alert></Container></AdminLayout>;

  const tabDataMap: Record<TabKey, { label: string; data: Payment[]; isRent: boolean }> = {
    pays_reject: { label: "Pagos Rechazados", data: data.rents_pendings.pays_reject, isRent: true },
    pays_overdue: { label: "Pagos Vencidos", data: data.rents_pendings.pays_overdue, isRent: true },
    pays_pending_review: { label: "Pagos en Revisión", data: data.rents_pendings.pays_pending_review, isRent: true },
    pending_user: { label: "Lavandería Usuario", data: data.washing_pendings.pending_user, isRent: false },
    pending_admin: { label: "Lavandería Admin", data: data.washing_pendings.pending_admin, isRent: false },
  };

  const renderRows = (items: Payment[], isRent: boolean) => items.map(item => {
    const finalProposedDate = item.counter_proposal_date || item.proposed_date || "-";
    const finalProposedTime = item.counter_proposal_time_slot || item.proposed_time_slot || "-";
  
    return (
      <TableRow key={item.id}>
        <TableCell>{item.user.name}</TableCell>
  
        {isRent ? (
          <>
            <TableCell>{`${item.contract?.building} - ${item.contract?.room_number}`}</TableCell>
            <TableCell>{item.month_paid}</TableCell>
          </>
        ) : (
          <>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.time_slot}</TableCell>
            <TableCell>{finalProposedDate}</TableCell>
            <TableCell>{finalProposedTime}</TableCell>
          </>
        )}
  
        <TableCell><Chip label={STATUS_LABELS[item.status] || item.status} /></TableCell>
  
        <TableCell>
          {item.voucher_path && (
            <Tooltip title="Ver comprobante de pago">
              <IconButton onClick={() => { setSelectedPayment(item); setOpenVoucher(true); }}>
                <Visibility />
              </IconButton>
            </Tooltip>
          )}
          {tab === "pays_pending_review" && (
            <>
              <Tooltip title="Aprobar pago">
                <IconButton color="success" onClick={() => handleApprove(item.id)}><Check /></IconButton>
              </Tooltip>
              <Tooltip title="Rechazar pago">
                <IconButton color="error" onClick={() => { setSelectedPayment(item); setOpenRejectModal(true); }}><Close /></IconButton>
              </Tooltip>
            </>
          )}
          {tab === "pending_admin" && (
            <>
              <Tooltip title="Aprobar solicitud de lavado">
                <IconButton color="success" onClick={() => handleApproveLaundry(item.id)}><Check /></IconButton>
              </Tooltip>
              <Tooltip title="Rechazar solicitud de lavado">
                <IconButton color="error" onClick={() => { setSelectedPayment(item); setOpenRejectLaundryModal(true); }}><Close /></IconButton>
              </Tooltip>
              <Tooltip title="Proponer nueva fecha y horario">
                <IconButton color="warning" onClick={() => { setSelectedPayment(item); setOpenRescheduleLaundryModal(true); }}><Info /></IconButton>
              </Tooltip>
            </>
          )}
        </TableCell>
      </TableRow>
    );
  });
  

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                bgcolor: "#ffcdd2", 
                cursor: "pointer",
                opacity: tab === "pays_reject" ? 1 : 0.7,
                border: tab === "pays_reject" ? '2px solid #d32f2f' : 'none',
                transition: 'all 0.3s ease'
              }} 
              onClick={() => setTab("pays_reject")}
            >
              <CardContent>
                <Typography align="center" fontWeight={tab === "pays_reject" ? "bold" : "normal"}>
                  Rechazados
                </Typography>
                <Typography align="center" variant="h4">{data.rents_pendings.pays_reject.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                bgcolor: "#ffe082", 
                cursor: "pointer",
                opacity: tab === "pays_pending_review" ? 1 : 0.7,
                border: tab === "pays_pending_review" ? '2px solid #f57f17' : 'none',
                transition: 'all 0.3s ease'
              }} 
              onClick={() => setTab("pays_pending_review")}
            >
              <CardContent>
                <Typography align="center" fontWeight={tab === "pays_pending_review" ? "bold" : "normal"}>
                  En Revisión
                </Typography>
                <Typography align="center" variant="h4">{data.rents_pendings.pays_pending_review.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                bgcolor: "#ef9a9a", 
                cursor: "pointer",
                opacity: tab === "pays_overdue" ? 1 : 0.7,
                border: tab === "pays_overdue" ? '2px solid #c62828' : 'none',
                transition: 'all 0.3s ease'
              }} 
              onClick={() => setTab("pays_overdue")}
            >
              <CardContent>
                <Typography align="center" fontWeight={tab === "pays_overdue" ? "bold" : "normal"}>
                  Vencidos
                </Typography>
                <Typography align="center" variant="h4">{data.rents_pendings.pays_overdue.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                bgcolor: "#ce93d8", 
                cursor: "pointer",
                opacity: tab === "pending_user" ? 1 : 0.7,
                border: tab === "pending_user" ? '2px solid #7b1fa2' : 'none',
                transition: 'all 0.3s ease'
              }} 
              onClick={() => setTab("pending_user")}
            >
              <CardContent>
                <Typography align="center" fontWeight={tab === "pending_user" ? "bold" : "normal"}>
                  Lavandería Usuario
                </Typography>
                <Typography align="center" variant="h4">{data.washing_pendings.pending_user.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                bgcolor: "#b39ddb", 
                cursor: "pointer",
                opacity: tab === "pending_admin" ? 1 : 0.7,
                border: tab === "pending_admin" ? '2px solid #4527a0' : 'none',
                transition: 'all 0.3s ease'
              }} 
              onClick={() => setTab("pending_admin")}
            >
              <CardContent>
                <Typography align="center" fontWeight={tab === "pending_admin" ? "bold" : "normal"}>
                  Lavandería Admin
                </Typography>
                <Typography align="center" variant="h4">{data.washing_pendings.pending_admin.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
          <TableHead sx={{ bgcolor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Usuario</TableCell>

              {tabDataMap[tab].isRent ? (
                <>
                  <TableCell sx={{ color: "white" }}>Habitación</TableCell>
                  <TableCell sx={{ color: "white" }}>Mes Pagado</TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ color: "white" }}>Fecha Inicial</TableCell>
                  <TableCell sx={{ color: "white" }}>Hora Inicial</TableCell>
                  <TableCell sx={{ color: "white" }}>Fecha Propuesta</TableCell>
                  <TableCell sx={{ color: "white" }}>Hora Propuesta</TableCell>
                </>
              )}

              <TableCell sx={{ color: "white" }}>Estado</TableCell>
              <TableCell sx={{ color: "white" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
            <TableBody>{renderRows(tabDataMap[tab].data, tabDataMap[tab].isRent)}</TableBody>
          </Table>
        </TableContainer>

        <ViewVoucherModal 
          open={openVoucher} onClose={() => setOpenVoucher(false)} 
          voucherImage={selectedPayment?.voucher_path || ""} 
          userComment={selectedPayment?.user_comment || undefined}
        />
        
        <RejectionModal
          open={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          rejectUrl={endpoints.payments.rejectRent(selectedPayment?.id || "")}
          //rejectUrl={`/payments/rent/${selectedPayment?.id}/reject/`}
          onSuccess={() => {
            setSnackbar({ open: true, message: "Pago rechazado", severity: "info" });
            setOpenRejectModal(false);
            setData((prev) => ({
              ...prev!,
              rents_pendings: {
                ...prev!.rents_pendings,
                pays_pending_review: prev!.rents_pendings.pays_pending_review.filter(p => p.id !== selectedPayment!.id),
                pays_reject: [...prev!.rents_pendings.pays_reject, selectedPayment!],
              },
            }));
          }}
          title="Rechazo de Pago"
        />

        <RejectionModal
          open={openRejectLaundryModal}
          onClose={() => setOpenRejectLaundryModal(false)}
          rejectUrl={endpoints.laundryManagement.reject(selectedPayment?.id || "")}
          //rejectUrl={`/laundry-bookings/${selectedPayment?.id}/reject/`}
          onSuccess={() => {
            setSnackbar({ open: true, message: "Lavado rechazado", severity: "info" });
            setOpenRejectLaundryModal(false);
            setData((prev) => ({
              ...prev!,
              washing_pendings: {
                ...prev!.washing_pendings,
                pending_admin: prev!.washing_pendings.pending_admin.filter(p => p.id !== selectedPayment!.id),
              },
            }));
          }}
          title="Rechazo de Reserva"
        />
        
        <RescheduleLaundryModal
          open={openRescheduleLaundryModal}
          onClose={() => setOpenRescheduleLaundryModal(false)}
          booking={tab === "pending_admin" ? (selectedPayment as unknown as LaundryBooking) : null}
          fetchBookings={fetchData}
        />

        <Snackbar 
          open={snackbar.open} autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
        
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;