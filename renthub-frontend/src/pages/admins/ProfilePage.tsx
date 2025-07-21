import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Box, 
  Typography,
  Grid, 
  Paper, 
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  Skeleton,
  Fade,
  Container,
  Breadcrumbs,
  Link,
  Alert,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Person,
  Security,
  AdminPanelSettings,
  Shield,
  Home,
  NavigateNext,
  Info,
  Verified,
  Edit,
  ExpandLess
} from '@mui/icons-material';
import AdminLayout from './AdminLayout';
import ProfileDetailsForm from '../../components/admins/forms/ProfileDetailsForm';
import ChangePasswordForm from '../../components/admins/forms/ChangePasswordForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ProfilePage = () => {
  const { user, isLoading } = useContext(AuthContext);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Simular carga de página para animaciones
    const timer = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'superadmin':
        return {
          label: 'Gerente',
          color: 'error' as const,
          icon: <AdminPanelSettings />,
          description: 'Acceso completo al sistema'
        };
      case 'admin':
        return {
          label: 'Administrador',
          color: 'warning' as const,
          icon: <Shield />,
          description: 'Permisos de administración'
        };
      default:
        return {
          label: 'Usuario',
          color: 'info' as const,
          icon: <Person />,
          description: 'Usuario estándar'
        };
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading || !user) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="text" width={200} height={48} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Container>
      </AdminLayout>
    );
  }

  const roleInfo = getRoleInfo(user.role);

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in={pageLoaded} timeout={800}>
          <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" />} 
              sx={{ mb: 3 }}
              aria-label="breadcrumb"
            >
              <Link 
                color="inherit" 
                href="#" 
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 0.5 }} fontSize="inherit" />
                Mi Perfil
              </Typography>
            </Breadcrumbs>

            {/* Header Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    {getInitials(user.first_name, user.last_name)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mr: 2 }}>
                      {user.first_name} {user.last_name}
                    </Typography>
                    <Chip
                      icon={roleInfo.icon}
                      label={roleInfo.label}
                      color={roleInfo.color}
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {user.email}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Verified color="success" fontSize="small" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      Cuenta verificada
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Última conexión
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Ahora
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Welcome Message */}
            <Collapse in={showWelcome}>
              <Alert 
                severity="info" 
                sx={{ mb: 4 }}
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setShowWelcome(false)}
                  >
                    <ExpandLess />
                  </IconButton>
                }
                icon={<Info />}
              >
                <Typography variant="body2">
                  <strong>¡Bienvenido/a, {user.first_name}!</strong> Desde aquí puedes gestionar tu información personal y configuraciones de seguridad.
                  {user.role === 'superadmin' && ' Como gerente, tienes acceso completo para editar tu perfil.'}
                </Typography>
              </Alert>
            </Collapse>

            {/* Navigation Tabs */}
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                mb: 3
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600
                  }
                }}
              >
                <Tab
                  icon={<Person />}
                  label="Información Personal"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<Security />}
                  label="Seguridad"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box>
              {/* Información Personal Tab */}
              <TabPanel value={activeTab} index={0}>
                <Fade in={activeTab === 0} timeout={600}>
                  <div>
                    {user.role === 'superadmin' ? (
                      <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Edit sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                              Editar Información Personal
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 3 }} />
                          <ProfileDetailsForm user={user} />
                        </CardContent>
                      </Card>
                    ) : (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                              Tu información personal está en modo de solo lectura. 
                              Contacta a un administrador para realizar cambios.
                            </Typography>
                          </Alert>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Nombre Completo
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              {user.first_name} {user.last_name}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Correo Electrónico
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {user.email}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Rol
                            </Typography>
                            <Chip
                              icon={roleInfo.icon}
                              label={roleInfo.label}
                              color={roleInfo.color}
                              size="small"
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Documento
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {user.document_type?.name}: {user.document_number}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Teléfono
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {user.phone_number || 'No especificado'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}
                  </div>
                </Fade>
              </TabPanel>

              {/* Seguridad Tab */}
              <TabPanel value={activeTab} index={1}>
                <Fade in={activeTab === 1} timeout={600}>
                  <div>
                    <ChangePasswordForm />
                  </div>
                </Fade>
              </TabPanel>
            </Box>
          </Box>
        </Fade>
      </Container>
    </AdminLayout>
  );
};

export default ProfilePage;