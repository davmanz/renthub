import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RescheduleLaundryModal from "./modals/LaundryManagement/RescheduleLaundryModal";
import { RejectionModal } from "../../components/shared/RejectionModal";
import {
  Container, Grid, Card, CardContent, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Paper, IconButton, Chip,
  CircularProgress, Alert, Tooltip, Snackbar
} from "@mui/material";
import { Info, Visibility, Check, Close } from "@mui/icons-material";
import { DashboardData, SnackbarState, Payment } from "../../types/types";
import { STATUS_LABELS } from "../../constants/status";
import "./AdminDashboard.css";

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
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/payments/rent/${id}/approve/`);
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
      await api.post(`/laundry-bookings/${id}/approve/`);
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

  if (loading)
    return (
      <AdminLayout>
        <div className="admin-dashboard-bg">
          <Container sx={{ textAlign: "center", mt: 8 }}>
            <CircularProgress />
          </Container>
        </div>
      </AdminLayout>
    );
  if (!data)
    return (
      <AdminLayout>
        <div className="admin-dashboard-bg">
          <Container>
            <Alert severity="error">No se pudo cargar el dashboard.</Alert>
          </Container>
        </div>
      </AdminLayout>
    );

  const tabDataMap: Record<TabKey, { label: string; data: Payment[]; isRent: boolean }> = {
    pays_reject: { label: "Pagos Rechazados", data: data.rents_pendings.pays_reject, isRent: true },
    pays_overdue: { label: "Pagos Vencidos", data: data.rents_pendings.pays_overdue, isRent: true },
    pays_pending_review: { label: "Pagos en Revisión", data: data.rents_pendings.pays_pending_review, isRent: true },
    pending_user: { label: "Lavandería Usuario", data: data.washing_pendings.pending_user, isRent: false },
    pending_admin: { label: "Lavandería Admin", data: data.washing_pendings.pending_admin, isRent: false },
  };

  const tabIcons: Record<TabKey, string> = {
    pays_reject: "❌",
    pays_overdue: "⏰",
    pays_pending_review: "🕵️",
    pending_user: "🧺",
    pending_admin: "🧼"
  };

  const renderRows = (items: Payment[], isRent: boolean) =>
    items.map(item => {
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

          <TableCell>
            <Chip label={STATUS_LABELS[item.status] || item.status} />
          </TableCell>

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
      <div className="admin-dashboard-bg">
        <Container maxWidth="lg" sx={{ pt: 6 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#fff"
            gutterBottom
            align="center"
            sx={{
              letterSpacing: "1.5px",
              textShadow: "0 6px 32px #00e1ff55"
            }}
          >
            Panel Administrativo Renthub
          </Typography>
          <Typography
            variant="subtitle1"
            color="#e2edfa"
            align="center"
            sx={{
              mb: 5,
              fontWeight: 500,
              opacity: 0.9
            }}
          >
            Gestión visual e inteligente de pagos y lavandería
          </Typography>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {[
              { tab: "pays_reject", color: "#fc5c7d" },
              { tab: "pays_pending_review", color: "#fbc531" },
              { tab: "pays_overdue", color: "#00b894" },
              { tab: "pending_user", color: "#54a0ff" },
              { tab: "pending_admin", color: "#6c47ff" }
            ].map(({ tab: key, color }) => (
              <Grid key={key} item xs={12} sm={6} md={2.4} sx={{ display: "flex" }}>
                <Card
                  className={`animated-card${tab === key ? " active" : ""}`}
                  sx={{
                    flex: 1,
                    background: tab === key
                      ? `linear-gradient(100deg, ${color} 0%, #ffffff22 120%)`
                      : `linear-gradient(100deg, #18235a 0%, #344494 120%)`,
                    border: tab === key ? `2.5px solid ${color}` : "none",
                    cursor: "pointer",
                    mb: 1.5
                  }}
                  onClick={() => setTab(key as TabKey)}
                  elevation={0}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}>
                    <span className="icon-emoji" aria-label="icon">{tabIcons[key as TabKey]}</span>
                    <Typography
                      align="center"
                      fontWeight={tab === key ? "bold" : "normal"}
                      sx={{
                        color: tab === key ? "#fff" : "#d7e7ff",
                        fontSize: "1.09rem"
                      }}
                    >
                      {tabDataMap[key as TabKey].label}
                    </Typography>
                    <Typography
                      align="center"
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mt: 0.7,
                        color: tab === key ? "#fff" : "#b6bfff",
                        textShadow: tab === key ? "0 2px 12px #fff7" : ""
                      }}
                    >
                      {tabDataMap[key as TabKey].data.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Paper className="dashboard-table-paper">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    {tabDataMap[tab].isRent ? (
                      <>
                        <TableCell>Habitación</TableCell>
                        <TableCell>Mes Pagado</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>Fecha Inicial</TableCell>
                        <TableCell>Hora Inicial</TableCell>
                        <TableCell>Fecha Propuesta</TableCell>
                        <TableCell>Hora Propuesta</TableCell>
                      </>
                    )}
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderRows(tabDataMap[tab].data, tabDataMap[tab].isRent)}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <ViewVoucherModal
            open={openVoucher} onClose={() => setOpenVoucher(false)}
            voucherImage={selectedPayment?.voucher_path || ""}
            userComment={selectedPayment?.user_comment || undefined}
          />
          <RejectionModal
            open={openRejectModal}
            onClose={() => setOpenRejectModal(false)}
            rejectUrl={`/payments/rent/${selectedPayment?.id}/reject/`}
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
            rejectUrl={`/laundry-bookings/${selectedPayment?.id}/reject/`}
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
            handleClose={() => setOpenRescheduleLaundryModal(false)}
            booking={selectedPayment}
            fetchBookings={fetchData}
          />
          <Snackbar
            open={snackbar.open} autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </Container>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
