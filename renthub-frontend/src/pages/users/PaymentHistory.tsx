import { useEffect, useState } from "react";
import {
  Typography, CircularProgress, Alert, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, Chip, Tooltip, Box, Card, CardContent,
  Stack, alpha, Fade, Skeleton, TableContainer
} from "@mui/material";
import { 
  Visibility, Block, Receipt, TrendingUp, CheckCircle, Schedule,
  Error as ErrorIcon, Info
} from "@mui/icons-material";
import { ReactElement } from "react";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { DateUtil } from "../../components/utils/DateUtil";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import { Payment } from "../../types/types";

type PaymentStatus = "approved" | "pending_review" | "rejected" | "overdue" | "upcoming";

const statusLabels: Record<PaymentStatus, string> = {
  approved: "Aprobado",
  pending_review: "Pendiente",
  rejected: "Rechazado",
  overdue: "Vencido",
  upcoming: "Futuro",
};

// Cambiar JSX.Element por ReactElement
const statusIcons: Record<PaymentStatus, ReactElement> = {
  approved: <CheckCircle />,
  pending_review: <Schedule />,
  rejected: <ErrorIcon />,
  overdue: <ErrorIcon />,
  upcoming: <Info />,
};

const statusConfigs: Record<PaymentStatus, { color: string; bgColor: string }> = {
  approved: { color: "#4caf50", bgColor: alpha("#4caf50", 0.15) },
  pending_review: { color: "#ff9800", bgColor: alpha("#ff9800", 0.15) },
  rejected: { color: "#f44336", bgColor: alpha("#f44336", 0.15) },
  overdue: { color: "#d32f2f", bgColor: alpha("#d32f2f", 0.15) },
  upcoming: { color: "#2196f3", bgColor: alpha("#2196f3", 0.15) },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(endpoints.payments.listRent);
        // Tipamos explícitamente los pagos
        const ordered: Payment[] = response.data.sort(
          (a: Payment, b: Payment) => b.month_paid.localeCompare(a.month_paid)
        );
        setPayments(ordered);
      } catch (err) {
        setError("Error al cargar el historial de pagos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleViewVoucher = (url: string) => setVoucherUrl(url);
  const handleCloseVoucher = () => setVoucherUrl(null);

  const getPaymentStats = () => {
    const total = payments.length;
    const approved = payments.filter(p => p.status === "approved").length;
    const pending = payments.filter(p => p.status === "pending_review").length;
    return { total, approved, pending };
  };

  const stats = getPaymentStats();

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
            <Receipt sx={{ fontSize: 40, color: '#64b5f6' }} />
            <Box>
              <Typography variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #64b5f6, #90caf9)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  mb: 0.5
                }}>
                Historial de Pagos
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gestiona y revisa todos tus pagos de alquiler
              </Typography>
            </Box>
          </Box>
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
                  Aprobados
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              minWidth: 120,
              bgcolor: alpha('#ff9800', 0.15),
              border: '1px solid rgba(255, 152, 0, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: "0 8px 24px rgba(255, 152, 0, 0.4)"
              }
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
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
            <Typography sx={{ color: '#90caf9' }}>Cargando historial...</Typography>
            <Box sx={{ mt: 3 }}>
              {[...Array(5)].map((_, i) => (
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
                color: '#ff6b6b'
              }}
            >
              {error}
            </Alert>
          </Box>
        )}
        {!loading && payments.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Receipt sx={{ fontSize: 80, color: alpha('#64b5f6', 0.3), mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
              No hay pagos registrados
            </Typography>
            <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
              Los pagos aparecerán aquí una vez que sean procesados
            </Typography>
          </Box>
        )}
        {!loading && payments.length > 0 && (
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
                      Mes
                    </TableCell>
                    <TableCell sx={{
                      color: '#64b5f6',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderBottom: 'none'
                    }}>
                      Fecha de Pago
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
                      Comprobante
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      onMouseEnter={() => setHoveredRow(payment.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: hoveredRow === payment.id
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
                        fontWeight: 500,
                        transition: 'color 0.3s ease'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{
                            color: '#64b5f6',
                            fontSize: 18,
                            transform: hoveredRow === payment.id ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.3s ease'
                          }} />
                          {DateUtil.getMonthAndYear(payment.month_paid)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        color: alpha('#90caf9', 0.9),
                        borderBottom: 'none'
                      }}>
                        {payment.payment_date}
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Chip
                          icon={statusIcons[payment.status]}
                          label={statusLabels[payment.status]}
                          size="small"
                          sx={{
                            bgcolor: statusConfigs[payment.status]?.bgColor,
                            color: statusConfigs[payment.status]?.color,
                            border: `1px solid ${alpha(statusConfigs[payment.status]?.color || '#64b5f6', 0.3)}`,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: `0 4px 12px ${alpha(statusConfigs[payment.status]?.color || '#64b5f6', 0.3)}`
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        {payment.receipt_image_url ? (
                          payment.status === "approved" || payment.status === "pending_review" ? (
                            <Tooltip
                              title="Ver comprobante"
                              placement="top"
                              arrow
                            >
                              <IconButton
                                onClick={() => handleViewVoucher(payment.receipt_image_url!)}
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
                          ) : (
                            <Tooltip
                              title="Comprobante no disponible en este estado"
                              placement="top"
                              arrow
                            >
                              <span>
                                <IconButton
                                  disabled
                                  sx={{
                                    bgcolor: alpha('#888', 0.1),
                                    border: '1px solid rgba(136, 136, 136, 0.3)'
                                  }}
                                >
                                  <Block sx={{ color: "#888" }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )
                        ) : (
                          <Typography sx={{ color: alpha('#90caf9', 0.5) }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}
      </Card>
      <ViewVoucherModal
        open={!!voucherUrl}
        onClose={handleCloseVoucher}
        voucherImage={voucherUrl || ""}
      />
    </Box>
  );
};

export default PaymentHistory;