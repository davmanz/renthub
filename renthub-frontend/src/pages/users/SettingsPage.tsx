import React from "react";
import {
  Typography, TextField, Grid, Alert, Avatar, Box, Chip, Skeleton,
  MenuItem, Select, FormControl, InputLabel, Card, CardContent, CardHeader,
  Button, IconButton, Divider, Stack, Tooltip, Badge, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Slide,
  useTheme, alpha, Accordion, AccordionSummary, AccordionDetails,
  Collapse, Paper, Fade
} from "@mui/material";
import {
  Edit, PhotoCamera, Save, Cancel, History, Person, Security,
  CheckCircle, Schedule, Error, ExpandMore, Upload, ExpandLess,
  Settings, ContactPhone
} from "@mui/icons-material";
import { useEffect, useState, forwardRef } from "react";
import { TransitionProps } from '@mui/material/transitions';
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { ChangeRequest, Changes } from "../../types/types";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const allowedFields = [
  { 
    value: "first_name", 
    label: "Nombre", 
    icon: <Person />, 
    category: "personal",
    type: "text" 
  },
  { 
    value: "last_name", 
    label: "Apellido", 
    icon: <Person />, 
    category: "personal",
    type: "text" 
  },
  { 
    value: "email", 
    label: "Correo electrónico", 
    icon: <Person />, 
    category: "contact",
    type: "email" 
  },
  { 
    value: "phone_number", 
    label: "Número de teléfono", 
    icon: <Person />, 
    category: "contact",
    type: "tel" 
  },
  { 
    value: "document_type", 
    label: "Tipo de documento", 
    icon: <Person />, 
    category: "identification",
    type: "select" 
  },
  { 
    value: "document_number", 
    label: "Número de documento", 
    icon: <Person />, 
    category: "identification",
    type: "text" 
  },
];

const statusConfig = {
  pending: { color: "#ff9800", icon: <Schedule />, label: "En revisión" },
  approved: { color: "#4caf50", icon: <CheckCircle />, label: "Aprobado" },
  rejected: { color: "#f44336", icon: <Error />, label: "Rechazado" }
};

const ModernCard = ({ 
  children, 
  color = '#64b5f6',
  ...props 
}: { 
  children: React.ReactNode;
  color?: string;
  [key: string]: any;
}) => (
  <Card 
    {...props}
    sx={{ 
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
      },
      ...props.sx
    }}
  >
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
    
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      {children}
    </Box>
  </Card>
);

const SettingsPage = () => {
  const theme = useTheme();
  const [user, setUser] = useState<any>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fieldToChange, setFieldToChange] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('personal');
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get(endpoints.auth.me);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get(endpoints.changeRequests.list);
      setChangeRequests(res.data);
    } catch {
      setChangeRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await api.get(endpoints.userManagement.documentTypes);
      setDocumentTypes(res.data);
    } catch {
      setDocumentTypes([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRequests();
    fetchDocumentTypes();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {
      setPhotoMessage("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_photo", selectedFile);

    setUploadingPhoto(true);
    try {
      await api.patch(endpoints.auth.me, formData);
      setPhotoMessage("Foto actualizada correctamente.");
      setSelectedFile(null);
      setPhotoPreview(null);
      fetchUser();
    } catch {
      setPhotoMessage("Error al subir la foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const isFieldPending = (fieldName: string) => {
    return changeRequests.some(
      (req) => fieldName in req.changes && req.status === "pending"
    );
  };

  const openEditDialog = (field: any) => {
    setFieldToChange(field.value);
    setCurrentValue(
      field.value === "document_type" 
        ? user?.document_type?.id 
        : user?.[field.value] || ""
    );
    setNewValue("");
    setRequestMessage("");
    setEditDialogOpen(true);
  };

  const handleRequestSubmit = async () => {
    if (!newValue.trim()) {
      setRequestMessage("Debes ingresar un nuevo valor.");
      return;
    }

    setSubmittingRequest(true);
    try {
      let changes: Changes = {};
      
      if (fieldToChange === "document_type") {
        const selectedType = documentTypes.find(type => type.id === newValue);
        if (selectedType) {
          changes.document_type = {
            id: selectedType.id,
            name: selectedType.name
          };
        }
      } else {
        // Para otros campos que son strings, usa type assertion más específica
        switch (fieldToChange) {
          case 'first_name':
            changes.first_name = newValue;
            break;
          case 'last_name':
            changes.last_name = newValue;
            break;
          case 'email':
            changes.email = newValue;
            break;
          case 'phone_number':
            changes.phone_number = newValue;
            break;
          case 'document_number':
            changes.document_number = newValue;
            break;
          default:
            // Fallback para campos no especificados
            (changes as any)[fieldToChange] = newValue;
        }
      }

      await api.post(endpoints.changeRequests.create, { changes });
      
      setRequestMessage("Solicitud enviada para revisión.");
      setEditDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      if (err.response?.data?.non_field_errors) {
        setRequestMessage(err.response.data.non_field_errors[0]);
      } else {
        setRequestMessage("Error al enviar la solicitud.");
      }
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getFieldsByCategory = (category: string) => {
    return allowedFields.filter(field => field.category === category);
  };

  const categories = [
    { id: 'personal', label: 'Información Personal', icon: <Person />, color: '#64b5f6' },
    { id: 'contact', label: 'Información de Contacto', icon: <ContactPhone />, color: '#81c784' },
    { id: 'identification', label: 'Identificación', icon: <Security />, color: '#ffb74d' }
  ];

  const getStats = () => {
    const total = changeRequests.length;
    const pending = changeRequests.filter(req => req.status === 'pending').length;
    const approved = changeRequests.filter(req => req.status === 'approved').length;
    return { total, pending, approved };
  };

  const stats = getStats();

  return (
    <Box sx={{ p: 0 }}>
      {/* Header moderno con gradiente */}
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #64b5f6 100%)'
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
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
            <Settings sx={{ fontSize: 40, color: '#64b5f6' }} />
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
                Configuración de Usuario
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Gestiona tu información personal y configuración de cuenta
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
          </Stack>
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
          {/* Foto de perfil */}
          <Grid item xs={12} lg={4}>
            <ModernCard color="#f06292">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCamera sx={{ color: '#f06292' }} />
                    <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
                      Foto de Perfil
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
                    Actualiza tu imagen de perfil
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <Divider sx={{ borderColor: alpha('#64b5f6', 0.2), mb: 2 }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    {loadingUser ? (
                      <Skeleton 
                        variant="circular" 
                        width={120} 
                        height={120} 
                        sx={{ bgcolor: alpha('#64b5f6', 0.1) }}
                      />
                    ) : (
                      <Avatar 
                        src={photoPreview || user?.profile_photo} 
                        sx={{ 
                          width: 120, 
                          height: 120,
                          boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)",
                          border: '3px solid #64b5f6',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }} 
                      />
                    )}
                    {uploadingPhoto && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha('#000', 0.5),
                        borderRadius: '50%'
                      }}>
                        <LinearProgress sx={{ width: '80%', color: '#64b5f6' }} />
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{
                        color: '#64b5f6',
                        borderColor: 'rgba(100, 181, 246, 0.3)',
                        bgcolor: alpha('#64b5f6', 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#64b5f6',
                          bgcolor: alpha('#64b5f6', 0.1),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Seleccionar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        hidden
                      />
                    </Button>
                    
                    {selectedFile && (
                      <Button
                        variant="contained"
                        onClick={handlePhotoSubmit}
                        disabled={uploadingPhoto}
                        startIcon={<Save />}
                        sx={{
                          bgcolor: '#64b5f6',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#42a5f5',
                            transform: 'translateY(-2px)',
                            boxShadow: "0 8px 24px rgba(100, 181, 246, 0.4)"
                          }
                        }}
                      >
                        Guardar
                      </Button>
                    )}
                  </Stack>

                  {photoMessage && (
                    <Alert 
                      severity={photoMessage.includes('Error') ? 'error' : 'success'}
                      sx={{ 
                        width: '100%',
                        bgcolor: photoMessage.includes('Error') 
                          ? alpha('#f44336', 0.15) 
                          : alpha('#4caf50', 0.15),
                        border: `1px solid ${photoMessage.includes('Error') 
                          ? 'rgba(244, 67, 54, 0.3)' 
                          : 'rgba(76, 175, 80, 0.3)'}`,
                        color: photoMessage.includes('Error') ? '#f44336' : '#4caf50'
                      }}
                    >
                      {photoMessage}
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </ModernCard>
          </Grid>

          {/* Información personal */}
          <Grid item xs={12} lg={8}>
            <ModernCard color="#81c784">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ color: '#81c784' }} />
                    <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
                      Información Personal
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography sx={{ color: alpha('#90caf9', 0.7) }}>
                    Gestiona tus datos personales
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <Divider sx={{ borderColor: alpha('#64b5f6', 0.2), mb: 2 }} />
              <CardContent sx={{ pt: 0 }}>
                {categories.map((category) => (
                  <Accordion
                    key={category.id}
                    expanded={expandedAccordion === category.id}
                    onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? category.id : false)}
                    sx={{ 
                      mb: 2, 
                      '&:before': { display: 'none' },
                      bgcolor: 'transparent',
                      color: 'white',
                      border: '1px solid rgba(100, 181, 246, 0.2)',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: '#90caf9' }} />}
                      sx={{ 
                        bgcolor: alpha(category.color, 0.1),
                        border: `1px solid ${alpha(category.color, 0.3)}`,
                        borderRadius: 2,
                        mb: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(category.color, 0.15),
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: '50%', 
                          bgcolor: alpha(category.color, 0.15),
                          border: `1px solid ${alpha(category.color, 0.3)}`
                        }}>
                          {React.cloneElement(category.icon, { sx: { color: category.color, fontSize: 20 } })}
                        </Box>
                        <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
                          {category.label}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: alpha('#0f1419', 0.3) }}>
                      <Grid container spacing={2}>
                        {getFieldsByCategory(category.id).map((field) => (
                          <Grid item xs={12} md={6} key={field.value}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                bgcolor: alpha('#64b5f6', 0.05),
                                border: '1px solid rgba(100, 181, 246, 0.2)',
                                borderRadius: 2,
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  bgcolor: alpha('#64b5f6', 0.08),
                                  border: '1px solid rgba(100, 181, 246, 0.3)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: "0 4px 12px rgba(100, 181, 246, 0.2)"
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle2" sx={{ color: alpha('#90caf9', 0.8), fontWeight: 500 }} gutterBottom>
                                    {field.label}
                                  </Typography>
                                  {loadingUser ? (
                                    <Skeleton 
                                      width="80%" 
                                      height={24} 
                                      sx={{ bgcolor: alpha('#64b5f6', 0.1) }}
                                    />
                                  ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
                                      {field.value === "document_type"
                                        ? documentTypes.find((d) => d.id === user?.document_type.id)?.name || "—"
                                        : user?.[field.value] || "—"}
                                    </Typography>
                                  )}
                                </Box>
                                
                                <Tooltip title={isFieldPending(field.value) ? "Solicitud en revisión" : "Solicitar cambio"} arrow>
                                  <Box>
                                    {isFieldPending(field.value) ? (
                                      <Chip
                                        icon={<Schedule />}
                                        label="En revisión"
                                        size="small"
                                        sx={{
                                          bgcolor: alpha('#ff9800', 0.15),
                                          color: '#ff9800',
                                          border: '1px solid rgba(255, 152, 0, 0.3)',
                                          fontWeight: 600
                                        }}
                                      />
                                    ) : (
                                      <IconButton
                                        size="small"
                                        onClick={() => openEditDialog(field)}
                                        sx={{
                                          bgcolor: alpha('#64b5f6', 0.1),
                                          border: '1px solid rgba(100, 181, 246, 0.3)',
                                          color: '#64b5f6',
                                          transition: 'all 0.3s ease',
                                          '&:hover': {
                                            bgcolor: alpha('#64b5f6', 0.2),
                                            transform: 'scale(1.1)',
                                            boxShadow: "0 4px 12px rgba(100, 181, 246, 0.3)"
                                          }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                </Tooltip>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </ModernCard>
          </Grid>

          {/* Historial de solicitudes */}
          <Grid item xs={12}>
            <ModernCard color="#ba68c8">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <History sx={{ color: '#ba68c8' }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
                        Historial de Solicitudes
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.7) }}>
                        {changeRequests.length} solicitud(es) registrada(s)
                      </Typography>
                    </Box>
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {changeRequests.filter(req => req.status === 'pending').length > 0 && (
                      <Badge 
                        badgeContent={changeRequests.filter(req => req.status === 'pending').length} 
                        sx={{
                          mr: 1,
                          '& .MuiBadge-badge': {
                            bgcolor: '#ff9800',
                            color: 'white'
                          }
                        }}
                      >
                        <Chip
                          icon={<Schedule />}
                          label="Pendientes"
                          size="small"
                          sx={{
                            bgcolor: alpha('#ff9800', 0.15),
                            color: '#ff9800',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            fontWeight: 600
                          }}
                        />
                      </Badge>
                    )}
                    <Button
                      onClick={() => setHistoryExpanded(!historyExpanded)}
                      variant="outlined"
                      size="small"
                      startIcon={historyExpanded ? <ExpandLess /> : <ExpandMore />}
                      sx={{
                        minWidth: 'auto',
                        color: '#64b5f6',
                        borderColor: 'rgba(100, 181, 246, 0.3)',
                        bgcolor: alpha('#64b5f6', 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#64b5f6',
                          bgcolor: alpha('#64b5f6', 0.1),
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {historyExpanded ? 'Contraer' : 'Expandir'}
                    </Button>
                  </Box>
                }
                sx={{ pb: 1 }}
              />
              <Divider sx={{ borderColor: alpha('#64b5f6', 0.2), mb: 2 }} />
              
              <Collapse in={historyExpanded} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                  {loadingRequests ? (
                    <Stack spacing={2}>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton 
                          key={i} 
                          variant="rectangular" 
                          height={100} 
                          sx={{ 
                            borderRadius: 2,
                            bgcolor: alpha('#64b5f6', 0.1)
                          }} 
                        />
                      ))}
                    </Stack>
                  ) : changeRequests.length > 0 ? (
                    <Stack spacing={2}>
                      {changeRequests.map((req) => {
                        const status = statusConfig[req.status as keyof typeof statusConfig];
                        return (
                          <Paper
                            key={req.id}
                            variant="outlined"
                            sx={{
                              p: 3,
                              bgcolor: alpha('#64b5f6', 0.05),
                              border: `2px solid ${alpha(status.color, 0.3)}`,
                              borderLeft: `6px solid ${status.color}`,
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                bgcolor: alpha('#64b5f6', 0.08),
                                transform: 'translateX(4px)',
                                boxShadow: `0 4px 12px ${alpha(status.color, 0.2)}`
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }} gutterBottom>
                                  Solicitud #{req.id}
                                </Typography>
                                {Object.entries(req.changes).map(([field, value]) => (
                                  <Typography key={field} variant="body2" sx={{ color: alpha('#90caf9', 0.8) }}>
                                    <strong>{allowedFields.find(f => f.value === field)?.label || field}:</strong>{' '}
                                    {field === 'document_type' 
                                      ? (value as any).name 
                                      : value as string}
                                  </Typography>
                                ))}
                              </Box>
                              
                              <Chip
                                icon={status.icon}
                                label={status.label}
                                size="small"
                                sx={{
                                  bgcolor: alpha(status.color, 0.15),
                                  color: status.color,
                                  border: `1px solid ${alpha(status.color, 0.3)}`,
                                  fontWeight: 600,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: `0 4px 12px ${alpha(status.color, 0.3)}`
                                  }
                                }}
                              />
                            </Box>
                            
                            <Divider sx={{ mb: 2, borderColor: alpha('#64b5f6', 0.2) }} />
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.8) }}>
                                  <strong>Fecha:</strong> {new Date(req.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.8) }}>
                                  <strong>Solicitante:</strong> {req.user.name}
                                </Typography>
                              </Grid>
                              {req.review_comment && (
                                <Grid item xs={12}>
                                  <Alert 
                                    severity="info" 
                                    sx={{ 
                                      mt: 1,
                                      bgcolor: alpha('#2196f3', 0.15),
                                      border: '1px solid rgba(33, 150, 243, 0.3)',
                                      color: '#2196f3'
                                    }}
                                  >
                                    <strong>Comentario de revisión:</strong> {req.review_comment}
                                  </Alert>
                                </Grid>
                              )}
                            </Grid>
                          </Paper>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <History sx={{ fontSize: 64, color: alpha('#90caf9', 0.3), mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }} gutterBottom>
                        No hay solicitudes registradas
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.7) }}>
                        Cuando realices cambios en tu información, aparecerán aquí
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Collapse>
            </ModernCard>
          </Grid>
        </Grid>
      </Fade>

      {/* Dialog para editar campos */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            bgcolor: '#0f1419',
            color: 'white',
            border: '1px solid rgba(100, 181, 246, 0.3)',
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              bgcolor: alpha('#64b5f6', 0.15),
              border: '1px solid rgba(100, 181, 246, 0.3)'
            }}>
              <Edit sx={{ color: '#64b5f6' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
                Solicitar Cambio
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#90caf9', 0.7) }}>
                {allowedFields.find(f => f.value === fieldToChange)?.label}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Valor actual"
                fullWidth
                value={
                  fieldToChange === "document_type"
                    ? user?.document_type?.name || currentValue
                    : currentValue
                }
                disabled
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha('#64b5f6', 0.05),
                    '& fieldset': {
                      borderColor: 'rgba(100, 181, 246, 0.2)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#90caf9'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              {fieldToChange === "document_type" ? (
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha('#64b5f6', 0.05),
                      '& fieldset': {
                        borderColor: 'rgba(100, 181, 246, 0.2)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#90caf9'
                    }
                  }}
                >
                  <InputLabel>Nuevo tipo de documento</InputLabel>
                  <Select
                    value={newValue}
                    label="Nuevo tipo de documento"
                    onChange={(e) => setNewValue(e.target.value)}
                  >
                    {documentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Nuevo valor"
                  fullWidth
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  type={allowedFields.find(f => f.value === fieldToChange)?.type || 'text'}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha('#64b5f6', 0.05),
                      '& fieldset': {
                        borderColor: 'rgba(100, 181, 246, 0.2)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(100, 181, 246, 0.4)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#64b5f6'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#90caf9'
                    }
                  }}
                />
              )}
            </Grid>

            {requestMessage && (
              <Grid item xs={12}>
                <Alert 
                  severity={requestMessage.includes('Error') ? 'error' : 'success'}
                  sx={{
                    bgcolor: requestMessage.includes('Error') 
                      ? alpha('#f44336', 0.15) 
                      : alpha('#4caf50', 0.15),
                    border: `1px solid ${requestMessage.includes('Error') 
                      ? 'rgba(244, 67, 54, 0.3)' 
                      : 'rgba(76, 175, 80, 0.3)'}`,
                    color: requestMessage.includes('Error') ? '#f44336' : '#4caf50'
                  }}
                >
                  {requestMessage}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<Cancel />}
            sx={{
              color: alpha('#90caf9', 0.8),
              borderColor: 'rgba(144, 202, 249, 0.3)',
              '&:hover': {
                bgcolor: alpha('#90caf9', 0.1)
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRequestSubmit}
            disabled={submittingRequest || !newValue.trim()}
            startIcon={<Save />}
            variant="contained"
            sx={{
              bgcolor: '#64b5f6',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#42a5f5',
                transform: 'translateY(-2px)',
                boxShadow: "0 8px 24px rgba(100, 181, 246, 0.4)"
              }
            }}
          >
            {submittingRequest ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;