import { useEffect, useState } from "react";
import {
  Typography, CircularProgress, Alert, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Box,
  alpha, Fade, Card, CardContent, Stack, Skeleton
} from "@mui/material";
import { 
  Close, Schedule, Visibility, Check, Info, Add, LocalLaundryService,
  CalendarToday, AccessTime
} from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";

import RejectReasonModal from "../../components/shared/RejectReasonModal";
import RescheduleModal from "../../components/utils/RescheduleModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import ReserveModal from "./modals/LaundryBookings/deprecado-ReserveModal";

const statusConfigs = {
  approved: { color: "#4caf50", bgColor: alpha("#4caf50", 0.15), label: "Aprobado" },
  rejected: { color: "#f44336", bgColor: alpha("#f44336", 0.15), label: "Rechazado" },
  pending_admin: { color: "#ff9800", bgColor: alpha("#ff9800", 0.15), label: "Pendiente Adm" },
  pending_user: { color: "#2196f3", bgColor: alpha("#2196f3", 0.15), label: "Pendiente Usr" }
};

const LaundryBookings = () => {
  const [laundryBookings, setLaundryBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openReserveModal, setOpenReserveModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

  const getBookingStats = () => {
    const total = laundryBookings.length;
    const approved = laundryBookings.filter(b => b.status === 'approved').length;
    const pending = laundryBookings.filter(b => b.pending_action === 'user').length;
    return { total, approved, pending };
  };

  const stats = getBookingStats();

  const getStatusConfig = (booking: any) => {
    if (booking.status === "approved") return statusConfigs.approved;
    if (booking.status === "rejected") return statusConfigs.rejected;
    if (booking.pending_action === "admin") return statusConfigs.pending_admin;
    return statusConfigs.pending_user;
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header moderno con gradiente */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)',
        color: 'white',
        p: 4,
        mb: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: "0 8px 32px rgba(100, 181, 246, 0.3)",
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LocalLaundryService sx={{ fontSize: 40, color: '#64b5f6' }} />
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #64b5f6, #90caf9)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  mb: 0.5
                }}
              >
                Mis Reservas de Lavandería
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gestiona tus reservas y horarios de lavandería
              </Typography>
            </Box>
          </Box>

          {/* Stats cards */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Card sx={{ 
              minWidth: 120,
              bgcolor: alpha('#64b5f6', 0.15),
              border: '1px solid rgba(100, 181, 246, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: "0 8px 24px rgba(100, 181, 246, 0.4)"
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ color: '#64b5f6', fontWeight: 600 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Total
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              minWidth: 120,
              bgcolor: alpha('#4caf50', 0.15),
              border: '1px solid rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)"
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Aprobadas
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              minWidth: 120,
              bgcolor: alpha('#2196f3', 0.15),
              border: '1px solid rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: "0 8px 24px rgba(33, 150, 243, 0.4)"
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 600 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Botón crear reserva */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenReserveModal(true)}
              sx={{
                bgcolor: '#64b5f6',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#42a5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: "0 8px 24px rgba(100, 181, 246, 0.4)"
                }
              }}
            >
              Crear Nueva Reserva
            </Button>
          </Box>
        </Box>

        {/* Elemento decorativo */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha('#64b5f6', 0.1),
          transform: 'rotate(45deg)',
          zIndex: 1
        }} />
      </Box>

      {/* Contenido principal */}
      <Card sx={{ 
        borderRadius: 3,
        bgcolor: '#0f1419',
        color: 'white',
        border: '1px solid rgba(100, 181, 246, 0.2)',
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        overflow: 'hidden'
      }}>
        {loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#64b5f6', mb: 2 }} />
            <Typography sx={{ color: '#90caf9' }}>Cargando reservas...</Typography>
            <Box sx={{ mt: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton 
                  key={i}
                  variant="rectangular" 
                  height={60} 
                  sx={{ mb: 1, bgcolor: alpha('#64b5f6', 0.1) }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert 
              severity="error" 
              sx={{ 
                bgcolor: alpha('#f44336', 0.15),
                border: '1px solid rgba(244, 67, 54, 0.3)',
                color: '#ff6b6b',
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {!loading && laundryBookings.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <LocalLaundryService sx={{ fontSize: 80, color: alpha('#64b5f6', 0.3), mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
              No tienes reservas activas
            </Typography>
            <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
              Crea tu primera reserva para gestionar tus horarios de lavandería
            </Typography>
          </Box>
        )}

        {!loading && laundryBookings.length > 0 && (
          <Fade in={true} timeout={600}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: alpha('#64b5f6', 0.1),
                    borderBottom: '2px solid rgba(100, 181, 246, 0.3)'
                  }}>
                    <TableCell sx={{ 
                      color: '#64b5f6', 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderBottom: 'none'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18 }} />
                        Fecha
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#64b5f6', 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderBottom: 'none'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 18 }} />
                        Horario
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#64b5f6', 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderBottom: 'none'
                    }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#64b5f6', 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderBottom: 'none'
                    }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laundryBookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking);
                    return (
                      <TableRow 
                        key={booking.id}
                        onMouseEnter={() => setHoveredRow(booking.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        sx={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.1)',
                          bgcolor: hoveredRow === booking.id 
                            ? alpha('#64b5f6', 0.08) 
                            : 'transparent',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            bgcolor: alpha('#64b5f6', 0.12),
                            boxShadow: '4px 0 12px rgba(100, 181, 246, 0.2)'
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          color: "white",
                          borderBottom: 'none',
                          fontWeight: 500
                        }}>
                          {booking.status === "counter_proposal"
                            ? booking.counter_proposal_date
                            : booking.status === "proposed"
                            ? booking.proposed_date
                            : booking.date}
                        </TableCell>

                        <TableCell sx={{ 
                          color: alpha('#90caf9', 0.9),
                          borderBottom: 'none'
                        }}>
                          {booking.status === "counter_proposal"
                            ? booking.counter_proposal_time_slot
                            : booking.status === "proposed"
                            ? booking.proposed_time_slot
                            : booking.time_slot}
                        </TableCell>

                        <TableCell sx={{ borderBottom: 'none' }}>
                          <Chip
                            label={statusConfig.label}
                            sx={{
                              bgcolor: statusConfig.bgColor,
                              color: statusConfig.color,
                              border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.3)}`
                              }
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ borderBottom: 'none' }}>
                          <Stack direction="row" spacing={1}>
                            {booking.pending_action === "user" && (
                              <>
                                <Tooltip title="Cancelar reserva" arrow>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setOpenRejectModal(true);
                                    }}
                                    sx={{
                                      color: '#f44336',
                                      bgcolor: alpha('#f44336', 0.1),
                                      border: '1px solid rgba(244, 67, 54, 0.3)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: alpha('#f44336', 0.2),
                                        transform: 'scale(1.1)',
                                        boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)"
                                      }
                                    }}
                                  >
                                    <Close />
                                  </IconButton>
                                </Tooltip>

                                {(booking.status === "counter_proposal" || booking.status === "proposed") && (
                                  <Tooltip title="Aceptar propuesta del administrador" arrow>
                                    <IconButton
                                      onClick={() => handleAcceptProposal(booking.id)}
                                      sx={{
                                        color: '#4caf50',
                                        bgcolor: alpha('#4caf50', 0.1),
                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          bgcolor: alpha('#4caf50', 0.2),
                                          transform: 'scale(1.1)',
                                          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)"
                                        }
                                      }}
                                    >
                                      <Check />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="Proponer nueva fecha" arrow>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setOpenRescheduleModal(true);
                                    }}
                                    sx={{
                                      color: '#ff9800',
                                      bgcolor: alpha('#ff9800', 0.1),
                                      border: '1px solid rgba(255, 152, 0, 0.3)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: alpha('#ff9800', 0.2),
                                        transform: 'scale(1.1)',
                                        boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)"
                                      }
                                    }}
                                  >
                                    <Schedule />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {booking.status === "approved" && (
                              <Tooltip title="Ver comprobante" arrow>
                                <IconButton
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setOpenVoucherModal(true);
                                  }}
                                  sx={{
                                    color: '#64b5f6',
                                    bgcolor: alpha('#64b5f6', 0.1),
                                    border: '1px solid rgba(100, 181, 246, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha('#64b5f6', 0.2),
                                      transform: 'scale(1.1)',
                                      boxShadow: "0 4px 12px rgba(100, 181, 246, 0.4)"
                                    }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            )}

                            {booking.status === "rejected" && booking.admin_comment && (
                              <Tooltip title="Ver motivo de rechazo" arrow>
                                <IconButton
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setOpenRejectModal(true);
                                  }}
                                  sx={{
                                    color: '#2196f3',
                                    bgcolor: alpha('#2196f3', 0.1),
                                    border: '1px solid rgba(33, 150, 243, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha('#2196f3', 0.2),
                                      transform: 'scale(1.1)',
                                      boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)"
                                    }
                                  }}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}
      </Card>

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
    </Box>
  );
};

export default LaundryBookings;
