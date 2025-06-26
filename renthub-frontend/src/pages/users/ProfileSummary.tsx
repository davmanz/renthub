import React from "react";
import { useEffect, useState } from "react";
import {
  Avatar, Box, Card, CardContent, Grid, Typography, Chip, Divider,
  Skeleton, Tooltip, Button, alpha, Fade, Stack,
  LinearProgress, IconButton
} from "@mui/material";
import {
  AccountCircle, Payment, Folder, Verified, Edit, Phone, Badge,
  Error as ErrorIcon, CloudUpload as CloudUploadIcon, CalendarToday,
  PersonPin, Security
} from "@mui/icons-material";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { useDashboard } from "../../components/shared/DashboardContext"; // Ajusta la ruta

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string;
  is_verified: boolean;
  phone_number?: string;
  document_type?: { name: string };
  document_number?: string;
  date_joined?: string;
  status_user?: "overdue" | "pending_review" | "ok";
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const LoadingSkeleton = () => (
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
    
    <Grid container spacing={3}>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} md={6} key={i}>
          <Skeleton 
            variant="rectangular" 
            height={200} 
            sx={{ 
              borderRadius: 3,
              bgcolor: alpha('#64b5f6', 0.1)
            }} 
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <Box sx={{ p: 0 }}>
    <Card sx={{ 
      borderRadius: 3,
      bgcolor: '#0f1419',
      border: '1px solid rgba(244, 67, 54, 0.3)',
      p: 4
    }}>
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <ErrorIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#f44336',
            fontWeight: 600,
            mb: 1
          }}
        >
          Error al cargar el perfil
        </Typography>
        <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
          {message}
        </Typography>
      </Box>
    </Card>
  </Box>
);

const InfoCard = ({ 
  icon, 
  title, 
  children, 
  color = '#64b5f6' 
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
  color?: string;
}) => (
  <Card sx={{ 
    borderRadius: 3,
    bgcolor: '#0f1419',
    color: 'white',
    border: '1px solid rgba(100, 181, 246, 0.2)',
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      border: '1px solid rgba(100, 181, 246, 0.3)'
    }
  }}>
    {/* Elemento decorativo */}
    <Box sx={{
      position: 'absolute',
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: alpha(color, 0.1),
      transform: 'rotate(45deg)',
      zIndex: 1
    }} />

    <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: '50%', 
          bgcolor: alpha(color, 0.15),
          border: `1px solid ${alpha(color, 0.3)}`,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon, { 
                style: { color, fontSize: 24 } 
              } as any)
            : icon
          }
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: '#90caf9'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Divider sx={{ 
        mb: 2, 
        borderColor: alpha('#64b5f6', 0.2) 
      }} />
      {children}
    </CardContent>
  </Card>
);

const AttachedDocuments = () => (
  <Box sx={{ textAlign: "center", py: 2 }}>
    <Typography 
      variant="body2" 
      sx={{ 
        color: alpha('#90caf9', 0.7),
        mb: 2
      }}
    >
      Próximamente podrás gestionar tus documentos aquí
    </Typography>
    <Button
      startIcon={<CloudUploadIcon />}
      variant="outlined"
      disabled
      sx={{ 
        mt: 1,
        color: alpha('#64b5f6', 0.5),
        borderColor: alpha('#64b5f6', 0.2),
        '&:disabled': {
          color: alpha('#64b5f6', 0.3),
          borderColor: alpha('#64b5f6', 0.1)
        }
      }}
    >
      Subir documentos
    </Button>
  </Box>
);

const ProfileSummary = () => {
  const { setOverdueCount } = useDashboard();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(endpoints.auth.me);

        console.log("User data fetched:", res.data.status_user);

        if (res.data.status_user != "ok") {
          setOverdueCount(1); // Actualiza el contador de pagos vencidos
        } else {
          setOverdueCount(0);
        }

        setUser(res.data);
      } catch {
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setOverdueCount]);

  const getStatusChip = () => {
    const statusInfo: Record<string, { message: string; color: string; bgColor: string; label: string }> = {
      overdue: {
        message: "Tienes pagos pendientes que requieren tu atención inmediata",
        color: "#f44336",
        bgColor: alpha("#f44336", 0.15),
        label: "Pago Vencido"
      },
      pending_review: {
        message: "Tus documentos están siendo revisados por nuestro equipo",
        color: "#ff9800",
        bgColor: alpha("#ff9800", 0.15),
        label: "En Revisión"
      },
      ok: {
        message: "Todos tus pagos están al día",
        color: "#4caf50",
        bgColor: alpha("#4caf50", 0.15),
        label: "Pagos al Día"
      }
    };

    const status = statusInfo[user?.status_user || "ok"];

    return (
      <Tooltip title={status.message} arrow>
        <Chip 
          label={status.label} 
          sx={{
            bgcolor: status.bgColor,
            color: status.color,
            border: `1px solid ${alpha(status.color, 0.3)}`,
            fontWeight: 600,
            px: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 4px 12px ${alpha(status.color, 0.3)}`
            }
          }}
        />
      </Tooltip>
    );
  };

  const getProfileCompletion = () => {
    const fields = [
      user?.first_name,
      user?.last_name,
      user?.email,
      user?.phone_number,
      user?.document_type,
      user?.document_number,
      user?.profile_photo
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  const profileCompletion = getProfileCompletion();

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
            <PersonPin sx={{ fontSize: 40, color: '#64b5f6' }} />
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
                Mi Perfil
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gestiona tu información personal y configuraciones
              </Typography>
            </Box>
          </Box>

          {/* Profile completion bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#90caf9' }}>
                Perfil completado
              </Typography>
              <Typography variant="body2" sx={{ color: '#64b5f6', fontWeight: 600 }}>
                {profileCompletion}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={profileCompletion}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha('#64b5f6', 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#64b5f6',
                  borderRadius: 4
                }
              }}
            />
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

      <Fade in={true} timeout={600}>
        <Grid container spacing={3}>
          {/* Perfil principal */}
          <Grid item xs={12} lg={4}>
            <InfoCard icon={<AccountCircle />} title="Información Personal" color="#64b5f6">
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={user?.profile_photo ? `${user.profile_photo}` : ""}
                    alt={user?.first_name || "Avatar"}
                    sx={{
                      width: 100,
                      height: 100,
                      margin: "0 auto",
                      border: "3px solid #64b5f6",
                      boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)",
                      mb: 2
                    }}
                  >
                    {!user?.profile_photo && <AccountCircle sx={{ width: 100, height: 100 }} />}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: -8,
                      bgcolor: '#64b5f6',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#42a5f5',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'white',
                    mb: 1
                  }}
                >
                  {user?.first_name} {user?.last_name}
                </Typography>
                
                <Typography 
                  sx={{ 
                    color: alpha('#90caf9', 0.8),
                    mb: 2
                  }}
                >
                  {user?.email}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center">
                  {user?.is_verified ? (
                    <Chip
                      icon={<Verified />}
                      label="Verificado"
                      sx={{
                        bgcolor: alpha('#4caf50', 0.15),
                        color: '#4caf50',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        fontWeight: 600
                      }}
                    />
                  ) : (
                    <Chip
                      label="No verificado"
                      sx={{
                        bgcolor: alpha('#666', 0.15),
                        color: '#666',
                        border: '1px solid rgba(102, 102, 102, 0.3)',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </InfoCard>
          </Grid>

          {/* Detalles del usuario */}
          <Grid item xs={12} lg={8}>
            <InfoCard icon={<Badge />} title="Detalles de la Cuenta" color="#81c784">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: alpha('#64b5f6', 0.05),
                    borderRadius: 2,
                    border: '1px solid rgba(100, 181, 246, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone sx={{ color: '#64b5f6', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Teléfono
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      {user?.phone_number || "No especificado"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: alpha('#64b5f6', 0.05),
                    borderRadius: 2,
                    border: '1px solid rgba(100, 181, 246, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Badge sx={{ color: '#64b5f6', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Tipo de Documento
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      {user?.document_type?.name || "No especificado"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: alpha('#64b5f6', 0.05),
                    borderRadius: 2,
                    border: '1px solid rgba(100, 181, 246, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Security sx={{ color: '#64b5f6', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Número de Documento
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      {user?.document_number || "No especificado"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: alpha('#64b5f6', 0.05),
                    borderRadius: 2,
                    border: '1px solid rgba(100, 181, 246, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday sx={{ color: '#64b5f6', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Fecha de Registro
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      {formatDate(user?.date_joined)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>

          {/* Estado de pagos */}
          <Grid item xs={12} md={6}>
            <InfoCard icon={<Payment />} title="Estado de Pagos" color="#f06292">
              <Box sx={{ py: 2 }}>
                {getStatusChip()}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.7) }}>
                    Última actualización: {formatDate(new Date().toISOString())}
                  </Typography>
                </Box>
              </Box>
            </InfoCard>
          </Grid>

          {/* Documentos adjuntos */}
          <Grid item xs={12} md={6}>
            <InfoCard icon={<Folder />} title="Documentos Adjuntos" color="#ba68c8">
              <AttachedDocuments />
            </InfoCard>
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
};

export default ProfileSummary;