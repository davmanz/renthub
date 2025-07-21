import {
  Box, 
  Drawer, 
  List, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  Avatar, 
  ListItemIcon, 
  ListItemButton,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Fade,
  useTheme,
  alpha
} from "@mui/material";
import {
  Dashboard, 
  People, 
  Assignment, 
  Apartment, 
  LocalLaundryService, 
  Logout, 
  SettingsSuggest, 
  Receipt, 
  AccountCircle,
  ExpandMore,
  AdminPanelSettings,
  Shield,
  Person
} from "@mui/icons-material";
import { ReactNode, useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { UserInterface } from "../../types/types";
import {ROLES} from "../../constants/roles";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUser(response.data);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    navigate("/dashboard/admin/profile");
    handleUserMenuClose();
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'superadmin':
        return { label: ROLES.superadmin, color: 'error' as const, icon: <AdminPanelSettings /> };
      case 'admin':
        return { label: ROLES.admin, color: 'warning' as const, icon: <Shield /> };
      default:
        return { label: ROLES.tenant, color: 'info' as const, icon: <Person /> };
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: <Dashboard />,
      path: '/dashboard/admin'
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: <People />,
      path: '/dashboard/admin/users'
    },
    {
      id: 'contracts',
      label: 'Gestión de Contratos',
      icon: <Assignment />,
      path: '/dashboard/admin/contract'
    },
    {
      id: 'sites',
      label: 'Gestión de Sitios',
      icon: <Apartment />,
      path: '/dashboard/admin/sites'
    },
    {
      id: 'payments',
      label: 'Historial de Pagos',
      icon: <Receipt />,
      path: '/dashboard/admin/payment-history'
    },
    {
      id: 'laundry',
      label: 'Gestión de Lavandería',
      icon: <LocalLaundryService />,
      path: '/dashboard/admin/laundry'
    },
    {
      id: 'requests',
      label: 'Solicitudes de Cambio',
      icon: <SettingsSuggest />,
      path: '/dashboard/admin/change-requests'
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#fafafa'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }} />
          <Typography>Cargando...</Typography>
        </Box>
      </Box>
    );
  }

  const roleInfo = getRoleInfo(user?.role || '');

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: '#fafafa' }}>
      {/* Sidebar Mejorado */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "white",
            borderRight: "none",
            boxShadow: theme.shadows[8]
          },
        }}
      >
        {/* User Profile Section - Simplificado */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            bgcolor: alpha('#fff', 0.05),
            borderRadius: 0,
            borderBottom: `1px solid ${alpha('#fff', 0.1)}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', color: 'white', mb: 0.5 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            {user?.email}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={roleInfo.icon}
              label={roleInfo.label}
              color={roleInfo.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* Navigation Menu */}
        <List sx={{ py: 2, px: 1, flexGrow: 1 }}>
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <Fade in key={item.id} timeout={300}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                    border: isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : '1px solid transparent',
                    "&:hover": { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateX(4px)',
                      boxShadow: theme.shadows[2]
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? theme.palette.primary.light : "#90caf9",
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.9rem'
                      }
                    }}
                  />
                </ListItemButton>
              </Fade>
            );
          })}
        </List>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200
            }
          }
        }}
      >
        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={logout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Enhanced AppBar */}
        <AppBar 
          position="static" 
          elevation={2}
          sx={{ 
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}>
              Dashboard del Administrador
            </Typography>
            
            {/* Header Actions - Solo avatar con menú */}
            <IconButton onClick={handleUserMenuOpen} color="inherit">
            <Avatar
              src={user?.profile_photo || undefined}
              sx={{ width: 32, height: 32 }}
            >
              {!user?.profile_photo && getInitials(user?.first_name, user?.last_name)}
            </Avatar>
            <ExpandMore sx={{ ml: 0.5 }} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#fafafa' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;