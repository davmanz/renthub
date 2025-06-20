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
  CircularProgress, Alert, Tooltip, Snackbar, Box, Avatar, Button,
  Fade, Slide, useTheme, alpha, CardActionArea, Divider
} from "@mui/material";
import { 
  Info, Visibility, Check, Close, Person, Home, CalendarToday, 
  Schedule, TrendingUp, Warning, CheckCircle, Cancel, Pending,
  LocalLaundryService, Payment as PaymentIcon
} from "@mui/icons-material";
import { DashboardData, SnackbarState, Payment } from "../../types/types";
import { STATUS_LABELS } from "../../constants/status";

type TabKey = "pays_reject" | "pays_overdue" | "pays_pending_review" | "pending_user" | "pending_admin";

const AdminDashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<TabKey>("pays_pending_review");
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

  if (loading) {
    return (
      <AdminLayout>
        <Container sx={{ 
          textAlign: "center", 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Cargando dashboard...
          </Typography>
        </Container>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <Container>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            No se pudo cargar el dashboard. Por favor, intenta nuevamente.
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  const tabDataMap: Record<TabKey, { 
    label: string; 
    data: Payment[]; 
    isRent: boolean; 
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
  }> = {
    pays_reject: { 
      label: "Rechazados", 
      data: data.rents_pendings.pays_reject, 
      isRent: true,
      icon: <Cancel />,
      color: "#d32f2f",
      bgColor: alpha("#d32f2f", 0.1),
      description: "Pagos que fueron rechazados"
    },
    pays_overdue: { 
      label: "Vencidos", 
      data: data.rents_pendings.pays_overdue, 
      isRent: true,
      icon: <Warning />,
      color: "#f57c00",
      bgColor: alpha("#f57c00", 0.1),
      description: "Pagos que han vencido"
    },
    pays_pending_review: { 
      label: "En Revisión", 
      data: data.rents_pendings.pays_pending_review, 
      isRent: true,
      icon: <Pending />,
      color: "#1976d2",
      bgColor: alpha("#1976d2", 0.1),
      description: "Pagos pendientes de aprobación"
    },
    pending_user: { 
      label: "Lavandería Usuario", 
      data: data.washing_pendings.pending_user, 
      isRent: false,
      icon: <LocalLaundryService />,
      color: "#7b1fa2",
      bgColor: alpha("#7b1fa2", 0.1),
      description: "Reservas pendientes del usuario"
    },
    pending_admin: { 
      label: "Lavandería Admin", 
      data: data.washing_pendings.pending_admin, 
      isRent: false,
      icon: <CheckCircle />,
      color: "#388e3c",
      bgColor: alpha("#388e3c", 0.1),
      description: "Reservas pendientes de administrador"
    },
  };

  const getStatusChipProps = (status: string) => {
    const statusConfig: Record<string, { color: any; variant: any }> = {
      'rejected': { color: 'error', variant: 'filled' },
      'overdue': { color: 'warning', variant: 'filled' },
      'pending_review': { color: 'info', variant: 'filled' },
      'pending_user': { color: 'secondary', variant: 'outlined' },
      'pending_admin': { color: 'success', variant: 'outlined' },
    };
    return statusConfig[status] || { color: 'default', variant: 'outlined' };
  };

  const renderRows = (items: Payment[], isRent: boolean) => items.map((item, index) => {
    const finalProposedDate = item.counter_proposal_date || item.proposed_date || "-";
    const finalProposedTime = item.counter_proposal_time_slot || item.proposed_time_slot || "-";
    const chipProps = getStatusChipProps(item.status);
  
    return (
      <Slide direction="up" in={true} timeout={300 + index * 100} key={item.id}>
        <TableRow 
          sx={{ 
            '&:hover': { 
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <Person fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {item.user.name}
                </Typography>
              </Box>
            </Box>
          </TableCell>
    
          {isRent ? (
            <>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home fontSize="small" color="action" />
                  <Typography variant="body2">
                    {`${item.contract?.building} - ${item.contract?.room_number}`}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon fontSize="small" color="action" />
                  <Typography variant="body2">{item.month_paid}</Typography>
                </Box>
              </TableCell>
            </>
          ) : (
            <>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">{item.date}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">{item.time_slot}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {finalProposedDate}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {finalProposedTime}
                </Typography>
              </TableCell>
            </>
          )}
    
          <TableCell>
            <Chip 
              label={STATUS_LABELS[item.status] || item.status}
              size="small"
              {...chipProps}
              sx={{ fontWeight: 'medium' }}
            />
          </TableCell>
    
          <TableCell>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {item.voucher_path && (
                <Tooltip title="Ver comprobante de pago" arrow>
                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#2196f3', 0.1),
                      '&:hover': { bgcolor: alpha('#2196f3', 0.2) }
                    }}
                    onClick={() => { setSelectedPayment(item); setOpenVoucher(true); }}
                  >
                    <Visibility fontSize="small" color="info" />
                  </IconButton>
                </Tooltip>
              )}
              {tab === "pays_pending_review" && (
                <>
                  <Tooltip title="Aprobar pago" arrow>
                    <IconButton 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#4caf50', 0.1),
                        '&:hover': { bgcolor: alpha('#4caf50', 0.2) }
                      }}
                      onClick={() => handleApprove(item.id)}
                    >
                      <Check fontSize="small" color="success" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rechazar pago" arrow>
                    <IconButton 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#f44336', 0.1),
                        '&:hover': { bgcolor: alpha('#f44336', 0.2) }
                      }}
                      onClick={() => { setSelectedPayment(item); setOpenRejectModal(true); }}
                    >
                      <Close fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {tab === "pending_admin" && (
                <>
                  <Tooltip title="Aprobar solicitud de lavado" arrow>
                    <IconButton 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#4caf50', 0.1),
                        '&:hover': { bgcolor: alpha('#4caf50', 0.2) }
                      }}
                      onClick={() => handleApproveLaundry(item.id)}
                    >
                      <Check fontSize="small" color="success" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rechazar solicitud de lavado" arrow>
                    <IconButton 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#f44336', 0.1),
                        '&:hover': { bgcolor: alpha('#f44336', 0.2) }
                      }}
                      onClick={() => { setSelectedPayment(item); setOpenRejectLaundryModal(true); }}
                    >
                      <Close fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Proponer nueva fecha y horario" arrow>
                    <IconButton 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#ff9800', 0.1),
                        '&:hover': { bgcolor: alpha('#ff9800', 0.2) }
                      }}
                      onClick={() => { setSelectedPayment(item); setOpenRescheduleLaundryModal(true); }}
                    >
                      <Info fontSize="small" color="warning" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </TableCell>
        </TableRow>
      </Slide>
    );
  });

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard Administrativo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona pagos de alquiler y reservas de lavandería
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(tabDataMap).map(([key, config], index) => (
            <Grid item xs={12} sm={6} md={key.includes('pending') ? 6 : 4} key={key}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: "pointer",
                    position: 'relative',
                    overflow: 'hidden',
                    border: tab === key ? `2px solid ${config.color}` : '1px solid',
                    borderColor: tab === key ? config.color : 'divider',
                    bgcolor: tab === key ? config.bgColor : 'background.paper',
                    transform: tab === key ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: tab === key ? 6 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                      '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      }
                    }
                  }}
                >
                  <CardActionArea onClick={() => setTab(key as TabKey)} sx={{ height: '100%' }}>
                    <CardContent sx={{ position: 'relative', p: 3 }}>
                      {/* Background Icon */}
                      <Box
                        className="card-icon"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          opacity: 0.1,
                          fontSize: '4rem',
                          transition: 'all 0.3s ease',
                          color: config.color
                        }}
                      >
                        {config.icon}
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(config.color, 0.15),
                            color: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {config.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h3" 
                            fontWeight="bold" 
                            color={config.color}
                            sx={{ mb: 0.5 }}
                          >
                            {config.data.length}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight="medium"
                            color={tab === key ? config.color : 'text.primary'}
                            sx={{ mb: 0.5 }}
                          >
                            {config.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {config.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Data Table */}
        <Fade in={true} timeout={500}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Table Header */}
            <Box sx={{ 
              p: 3, 
              bgcolor: tabDataMap[tab].bgColor,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    color: tabDataMap[tab].color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {tabDataMap[tab].icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color={tabDataMap[tab].color}>
                    {tabDataMap[tab].label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tabDataMap[tab].data.length} elementos
                  </Typography>
                </Box>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(tabDataMap[tab].color, 0.05) }}>
                    <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                      Usuario
                    </TableCell>

                    {tabDataMap[tab].isRent ? (
                      <>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Habitación
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Mes Pagado
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Fecha Inicial
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Hora Inicial
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Fecha Propuesta
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                          Hora Propuesta
                        </TableCell>
                      </>
                    )}

                    <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: tabDataMap[tab].color }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabDataMap[tab].data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={tabDataMap[tab].isRent ? 5 : 7}
                        sx={{ textAlign: 'center', py: 6 }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          gap: 2,
                          color: 'text.secondary'
                        }}>
                          {tabDataMap[tab].icon}
                          <Typography variant="h6">
                            No hay elementos en esta categoría
                          </Typography>
                          <Typography variant="body2">
                            Los nuevos elementos aparecerán aquí automáticamente
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    renderRows(tabDataMap[tab].data, tabDataMap[tab].isRent)
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>

        {/* Modals */}
        <ViewVoucherModal 
          open={openVoucher} 
          onClose={() => setOpenVoucher(false)} 
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
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;