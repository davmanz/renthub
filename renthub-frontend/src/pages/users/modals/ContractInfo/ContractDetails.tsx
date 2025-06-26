import React from "react"; 
import { 
  Grid, Typography, Chip, Card, CardContent, Box, Button, 
  alpha, Stack, Paper
} from "@mui/material";
import {
  Home, CalendarToday, AttachMoney, Wifi, Security,
  Warning, CheckCircle, Payment, Visibility, Error as ErrorIcon
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
  <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
    {contract.next_month?.status === "pending_review" ? (
      <Chip
        label="Pago en Revisión"
        icon={<Warning />}
        sx={{ 
          fontSize: 16, 
          fontWeight: 600, 
          px: 3,
          py: 1,
          bgcolor: alpha('#ff9800', 0.15),
          color: '#ff9800',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)"
          }
        }}
      />
    ) : contract.is_overdue ? (
      <Chip
        label="Pendiente de Pago"
        icon={<Warning />}
        sx={{ 
          fontSize: 16, 
          fontWeight: 600, 
          px: 3,
          py: 1,
          bgcolor: alpha('#f44336', 0.15),
          color: '#f44336',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)"
          }
        }}
      />
    ) : (
      <Chip
        label="Pagos al Día"
        icon={<CheckCircle />}
        sx={{ 
          fontSize: 16, 
          fontWeight: 600, 
          px: 3,
          py: 1,
          bgcolor: alpha('#4caf50', 0.15),
          color: '#4caf50',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)"
          }
        }}
      />
    )}
  </Grid>
);

const InfoItem = ({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string 
}) => (
  <Paper sx={{ 
    p: 2,
    bgcolor: alpha('#64b5f6', 0.05),
    border: '1px solid rgba(100, 181, 246, 0.2)',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      bgcolor: alpha('#64b5f6', 0.08),
      border: '1px solid rgba(100, 181, 246, 0.3)',
      boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
    }
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: '50%', 
        bgcolor: alpha(color, 0.15),
        border: `1px solid ${alpha(color, 0.3)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: 20
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.8), fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const ContractDetails = ({ contract, modalStates, setModalStates }: Props) => {
  const next = contract.next_month;

  const handleModalStateChange = (key: keyof ModalStates, value: boolean) => {
    setModalStates({ ...modalStates, [key]: value });
  };

  return (
    <Card sx={{ 
      bgcolor: alpha('#0f1419', 0.95),
      color: "white", 
      borderRadius: 3,
      border: '1px solid rgba(100, 181, 246, 0.2)',
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Elemento decorativo */}
      <Box sx={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: alpha('#64b5f6', 0.1),
        transform: 'rotate(45deg)',
        zIndex: 1
      }} />

      <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {/* Header del contrato */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 2,
              p: 3,
              bgcolor: alpha('#64b5f6', 0.1),
              borderRadius: 2,
              border: '1px solid rgba(100, 181, 246, 0.2)',
              mb: 2
            }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: alpha('#64b5f6', 0.2),
                border: '1px solid rgba(100, 181, 246, 0.3)'
              }}>
                <Home sx={{ color: "#64b5f6", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #64b5f6, #90caf9)',
                    backgroundClip: 'text',
                    color: 'transparent',
                    mb: 0.5
                  }}
                >
                  {contract.building_name}
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#90caf9', 0.9) }}>
                  Habitación {contract.room_number}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <ContractStatus contract={contract} />

          {/* Información del contrato */}
          <Grid item xs={12}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#90caf9', 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Detalles del Contrato
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<CalendarToday />}
                  label="Fecha de Inicio"
                  value={contract.start_date}
                  color="#64b5f6"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<CalendarToday />}
                  label="Fecha de Fin"
                  value={contract.end_date}
                  color="#ff7043"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<AttachMoney />}
                  label="Renta Mensual"
                  value={`$${contract.rent_amount}`}
                  color="#66bb6a"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <InfoItem
                  icon={<Security />}
                  label="Depósito"
                  value={`$${contract.deposit_amount}`}
                  color="#fdd835"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* WiFi Information */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3,
              bgcolor: contract.includes_wifi 
                ? alpha('#42a5f5', 0.1) 
                : alpha('#666', 0.1),
              border: `1px solid ${contract.includes_wifi 
                ? 'rgba(66, 165, 245, 0.3)' 
                : 'rgba(102, 102, 102, 0.3)'}`,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: contract.includes_wifi 
                  ? "0 4px 12px rgba(66, 165, 245, 0.2)"
                  : "0 4px 12px rgba(0,0,0,0.2)"
              }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Wifi sx={{ 
                  color: contract.includes_wifi ? "#42a5f5" : "#666",
                  fontSize: 24
                }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                  WiFi: {contract.includes_wifi ? "Incluido" : "No incluido"}
                </Typography>
              </Box>
              {contract.includes_wifi && (
                <Chip 
                  label={`Costo WiFi: $${contract.wifi_cost}`} 
                  sx={{ 
                    bgcolor: alpha('#42a5f5', 0.15),
                    color: '#42a5f5',
                    border: '1px solid rgba(66, 165, 245, 0.3)',
                    fontWeight: 600
                  }} 
                />
              )}
            </Paper>
          </Grid>

          {/* Sección de pagos */}
          {next && (
            <Grid item xs={12}>
              <Box sx={{ 
                textAlign: "center", 
                mt: 2,
                p: 3,
                bgcolor: alpha('#1a1f2e', 0.5),
                borderRadius: 2,
                border: '1px solid rgba(100, 181, 246, 0.2)'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    color: '#90caf9',
                    fontWeight: 600
                  }}
                >
                  Próximo Pago
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'white'
                  }}
                >
                  Mes a pagar: <span style={{ color: '#64b5f6' }}>
                    {DateUtil.getMonthAndYear(next.payment)}
                  </span>
                </Typography>

                {/* Estados de pago con botones mejorados */}
                <Stack spacing={2} alignItems="center">
                  {next.status === "overdue" && next.voucher && next.admin_comment && (
                    <>
                      <Chip 
                        label="Pago rechazado" 
                        icon={<ErrorIcon />}
                        sx={{ 
                          bgcolor: alpha('#f44336', 0.15),
                          color: '#f44336',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          px: 2
                        }} 
                      />
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={() => handleModalStateChange("rejectReason", true)}
                          sx={{
                            color: '#f44336',
                            borderColor: 'rgba(244, 67, 54, 0.3)',
                            bgcolor: alpha('#f44336', 0.05),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#f44336',
                              bgcolor: alpha('#f44336', 0.1),
                              transform: 'translateY(-2px)',
                              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)"
                            }
                          }}
                        >
                          Ver motivo del rechazo
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Payment />}
                          onClick={() => handleModalStateChange("uploadPayment", true)}
                          sx={{
                            bgcolor: '#f44336',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#d32f2f',
                              transform: 'translateY(-2px)',
                              boxShadow: "0 8px 24px rgba(244, 67, 54, 0.4)"
                            }
                          }}
                        >
                          Subir nuevo comprobante
                        </Button>
                      </Stack>
                    </>
                  )}

                  {next.status === "pending_review" && next.voucher && (
                    <>
                      <Chip
                        label="Pendiente por revisión"
                        icon={<Warning />}
                        sx={{ 
                          fontSize: 16, 
                          fontWeight: 600, 
                          mb: 1,
                          bgcolor: alpha('#ff9800', 0.15),
                          color: '#ff9800',
                          border: '1px solid rgba(255, 152, 0, 0.3)',
                          px: 2
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleModalStateChange("viewVoucher", true)}
                        sx={{
                          color: '#64b5f6',
                          borderColor: 'rgba(100, 181, 246, 0.3)',
                          bgcolor: alpha('#64b5f6', 0.05),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#64b5f6',
                            bgcolor: alpha('#64b5f6', 0.1),
                            transform: 'translateY(-2px)',
                            boxShadow: "0 4px 12px rgba(100, 181, 246, 0.3)"
                          }
                        }}
                      >
                        Ver Comprobante
                      </Button>
                    </>
                  )}

                  {next.status === "overdue" && !next.voucher && (
                    <Button
                      variant="contained"
                      startIcon={<Payment />}
                      onClick={() => handleModalStateChange("uploadPayment", true)}
                      sx={{
                        bgcolor: '#f44336',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#d32f2f',
                          transform: 'translateY(-2px)',
                          boxShadow: "0 8px 24px rgba(244, 67, 54, 0.4)"
                        }
                      }}
                    >
                      Subir Comprobante
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContractDetails;
