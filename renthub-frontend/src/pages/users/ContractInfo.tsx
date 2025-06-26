import { useState } from "react";
import { 
  Typography, CircularProgress, Alert, FormControl, 
  InputLabel, Select, MenuItem, Box, alpha, Skeleton,
  Fade, Card, CardContent, Chip
} from "@mui/material";
import { Assignment, Home, PersonPin, ExpandMore } from "@mui/icons-material";
import { useContracts } from "./modals/ContractInfo/useContracts";
import ContractDetails from "./modals/ContractInfo/ContractDetails";
import UploadPaymentModal from "./modals/ContractInfo/UploadPaymentModal";
import ViewVoucherModal from "../../components/shared/ViewVoucherModal";
import RejectReasonModal from "../../components/shared/RejectReasonModal";

const ContractInfo = () => {
  
  const { contracts, loading, error, refetchContracts } = useContracts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedContract = contracts.find((c) => c.id === selectedId) || contracts[0];

  interface ModalStates {
    uploadPayment: boolean;
    viewVoucher: boolean;
    rejectReason: boolean;
  }

  const [modalStates, setModalStates] = useState<ModalStates>({
    uploadPayment: false,
    viewVoucher: false,
    rejectReason: false,
  });

  if (loading) {
    return (
      <Box sx={{ p: 0 }}>
        {/* Header skeleton */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)',
          p: 4,
          mb: 3,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Skeleton 
            variant="text" 
            width={300} 
            height={60} 
            sx={{ bgcolor: alpha('#64b5f6', 0.2) }} 
          />
          <Skeleton 
            variant="text" 
            width={200} 
            height={30} 
            sx={{ bgcolor: alpha('#64b5f6', 0.1) }} 
          />
        </Box>
        
        {/* Content skeleton */}
        <Card sx={{ 
          borderRadius: 3,
          bgcolor: '#0f1419',
          border: '1px solid rgba(100, 181, 246, 0.2)',
          p: 4
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#64b5f6', mb: 2 }} />
            <Typography sx={{ color: '#90caf9' }}>Cargando contratos...</Typography>
            <Box sx={{ mt: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton 
                  key={i}
                  variant="rectangular" 
                  height={80} 
                  sx={{ mb: 2, bgcolor: alpha('#64b5f6', 0.1), borderRadius: 2 }} 
                />
              ))}
            </Box>
          </Box>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 0 }}>
        <Card sx={{ 
          borderRadius: 3,
          bgcolor: '#0f1419',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          p: 4
        }}>
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
        </Card>
      </Box>
    );
  }

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
            <Assignment sx={{ fontSize: 40, color: '#64b5f6' }} />
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
                Información del Contrato
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gestiona los detalles y pagos de tu contrato de alquiler
              </Typography>
            </Box>
          </Box>

          {/* Contract stats */}
          {contracts.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Home />}
                label={`${contracts.length} Contrato${contracts.length > 1 ? 's' : ''}`}
                sx={{
                  bgcolor: alpha('#64b5f6', 0.15),
                  color: '#64b5f6',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: "0 4px 12px rgba(100, 181, 246, 0.4)"
                  }
                }}
              />
              {selectedContract && (
                <Chip
                  icon={<PersonPin />}
                  label={`${selectedContract.building_name} - Hab. ${selectedContract.room_number}`}
                  sx={{
                    bgcolor: alpha('#4caf50', 0.15),
                    color: '#4caf50',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)"
                    }
                  }}
                />
              )}
            </Box>
          )}
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
        <CardContent sx={{ p: 4 }}>
          {/* Selector de contratos */}
          {contracts.length > 1 && (
            <Fade in={true} timeout={400}>
              <Box sx={{ mb: 4 }}>
                <FormControl 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha('#64b5f6', 0.05),
                      border: '1px solid rgba(100, 181, 246, 0.3)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#64b5f6', 0.08),
                        border: '1px solid rgba(100, 181, 246, 0.5)',
                        transform: 'translateY(-1px)',
                        boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
                      },
                      '&.Mui-focused': {
                        bgcolor: alpha('#64b5f6', 0.1),
                        border: '1px solid #64b5f6',
                        boxShadow: "0 0 0 2px rgba(100, 181, 246, 0.2)"
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#90caf9',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#64b5f6'
                      }
                    },
                    '& .MuiSelect-select': {
                      color: 'white',
                      fontWeight: 500
                    },
                    '& .MuiSelect-icon': {
                      color: '#64b5f6'
                    }
                  }}
                >
                  <InputLabel>Selecciona un contrato</InputLabel>
                  <Select
                    value={selectedContract?.id || ""}
                    onChange={(e) => setSelectedId(e.target.value)}
                    IconComponent={ExpandMore}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#1a1f2e',
                          border: '1px solid rgba(100, 181, 246, 0.3)',
                          borderRadius: 2,
                          mt: 1,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          '& .MuiMenuItem-root': {
                            color: 'white',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha('#64b5f6', 0.12),
                              transform: 'translateX(4px)'
                            },
                            '&.Mui-selected': {
                              bgcolor: alpha('#64b5f6', 0.15),
                              border: '1px solid rgba(100, 181, 246, 0.3)',
                              '&:hover': {
                                bgcolor: alpha('#64b5f6', 0.2)
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    {contracts.map((contract) => (
                      <MenuItem key={contract.id} value={contract.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Home sx={{ color: '#64b5f6', fontSize: 18 }} />
                          {contract.building_name} - Habitación {contract.room_number}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Fade>
          )}

          {/* Detalles del contrato */}
          {selectedContract && (
            <Fade in={true} timeout={600}>
              <Box>
                <ContractDetails
                  contract={selectedContract}
                  modalStates={modalStates}
                  setModalStates={(value) => setModalStates(prev => ({ ...prev, ...value }))}
                />
              </Box>
            </Fade>
          )}

          {/* Estado sin contratos */}
          {contracts.length === 0 && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 80, color: alpha('#64b5f6', 0.3), mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
                No hay contratos disponibles
              </Typography>
              <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
                Los contratos aparecerán aquí una vez que sean asignados
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modales integrados directamente */}
      {modalStates.uploadPayment && selectedContract?.next_month && (
        <UploadPaymentModal
          open={modalStates.uploadPayment}
          onClose={() => {
            setModalStates({ ...modalStates, uploadPayment: false });
            refetchContracts(); 
          }}
          nextPaymentMonth={selectedContract.next_month.payment}
          paymentId={selectedContract.next_month.id}
        />
      )}

      {modalStates.viewVoucher && selectedContract?.next_month?.voucher && (
        <ViewVoucherModal
          open={modalStates.viewVoucher}
          onClose={() => setModalStates({ ...modalStates, viewVoucher: false })}
          voucherImage={selectedContract.next_month.voucher}
        />
      )}

      {modalStates.rejectReason && selectedContract?.next_month?.admin_comment && (
        <RejectReasonModal
          open={modalStates.rejectReason}
          onClose={() => setModalStates({ ...modalStates, rejectReason: false })}
          adminComment={selectedContract.next_month.admin_comment}
          voucherImage={selectedContract.next_month.voucher ?? undefined}

        />
      )}
    </Box>
  );
};

export default ContractInfo;
