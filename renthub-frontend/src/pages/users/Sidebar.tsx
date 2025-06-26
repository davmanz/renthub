import {
  Box, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Avatar, Button, Typography, Divider, Tooltip, ListItemButton,
  Badge, Collapse, IconButton, alpha
} from "@mui/material";
import {
  Assignment, Payments, LocalLaundryService,
  Settings, Logout, ChevronLeft, ChevronRight,
  Dashboard
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import endpoints from "../../api/endpoints";
import { UserInterface } from "../../types/types";
import { useDashboard } from "../../components/shared/DashboardContext";

interface SidebarProps {
  onSelect: (section: string) => void;
  activeSection?: string;
}

const Sidebar = ({ onSelect, activeSection = "inicio" }: SidebarProps) => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { overdueCount } = useDashboard();


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        setUser(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario.");
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { id: "inicio", label: "Dashboard", icon: <Dashboard />, section: "inicio" },
    { id: "contrato", label: "Contrato", icon: <Assignment />, section: "contrato", badge: overdueCount > 0 ? overdueCount : null },
    { id: "pagos", label: "Pagos", icon: <Payments />, section: "pagos" },
    { id: "lavanderia", label: "Lavandería", icon: <LocalLaundryService />, section: "lavanderia" },
    { id: "configuracion", label: "Configuración", icon: <Settings />, section: "configuracion" }
  ];

  const sidebarWidth = collapsed ? 80 : 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          bgcolor: "#0f1419",
          color: "white",
          borderRight: "none",
          background: "linear-gradient(180deg, #0f1419 0%, #1a1f2e 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
          transition: 'width 0.3s ease-in-out',
          overflow: 'hidden'
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        p: collapsed ? 1 : 3, 
        textAlign: "center",
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        mb: 2
      }}>
        {/* Collapse Toggle */}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            position: 'absolute',
            top: 12,
            right: collapsed ? 8 : 12,
            color: '#64b5f6',
            bgcolor: alpha('#64b5f6', 0.1),
            '&:hover': {
              bgcolor: alpha('#64b5f6', 0.2),
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>

        <Collapse in={!collapsed} timeout={300}>
          <Avatar
            src={user?.profile_photo ? `${user.profile_photo}` : ""}
            alt={user?.first_name || "Avatar"}
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto 16px auto",
              border: "3px solid #64b5f6",
              boxShadow: "0 8px 24px rgba(100, 181, 246, 0.3)",
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: "0 12px 32px rgba(100, 181, 246, 0.4)"
              }
            }}
          />
          <Typography variant="h6" sx={{ 
            fontWeight: "600", 
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #64b5f6, #90caf9)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 0.5
          }}>
            {user ? `${user.first_name} ${user.last_name}` : "Cargando..."}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: alpha('#90caf9', 0.8),
            fontSize: '0.85rem'
          }}>
            {user?.email}
          </Typography>
        </Collapse>

        {collapsed && (
          <Avatar
            src={user?.profile_photo ? `${user.profile_photo}` : ""}
            alt={user?.first_name || "Avatar"}
            sx={{
              width: 48,
              height: 48,
              margin: "16px auto",
              border: "2px solid #64b5f6",
              boxShadow: "0 4px 12px rgba(100, 181, 246, 0.3)"
            }}
          />
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} sx={{ px: 0, mb: 0.5 }}>
            <Tooltip 
              title={collapsed ? item.label : ""} 
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => onSelect(item.section)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  minHeight: 52,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: activeSection === item.section 
                    ? alpha('#64b5f6', 0.15) 
                    : 'transparent',
                  border: activeSection === item.section 
                    ? '1px solid rgba(100, 181, 246, 0.3)'
                    : '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha('#64b5f6', 0.12),
                    transform: 'translateX(4px)',
                    border: '1px solid rgba(100, 181, 246, 0.2)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: activeSection === item.section ? '4px' : '0px',
                    bgcolor: '#64b5f6',
                    transition: 'width 0.3s ease',
                    borderRadius: '0 2px 2px 0'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeSection === item.section ? '#64b5f6' : '#90caf9',
                  minWidth: collapsed ? 'auto' : 56,
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: hoveredItem === item.id ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {item.badge ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                
                <Collapse in={!collapsed} orientation="horizontal">
                  <ListItemText 
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        fontWeight: activeSection === item.section ? 600 : 400,
                        color: activeSection === item.section ? '#64b5f6' : 'white',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  />
                </Collapse>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Footer Section */}
      <Box sx={{ p: collapsed ? 1 : 2, mt: "auto" }}>
        <Divider sx={{ 
          bgcolor: alpha('#90caf9', 0.2), 
          mb: 2,
          display: collapsed ? 'none' : 'block'
        }} />
        
        <Tooltip title={collapsed ? "Cerrar Sesión" : ""} placement="right" arrow>
          <Button
            variant="outlined"
            color="error"
            fullWidth={!collapsed}
            size={collapsed ? "small" : "medium"}
            startIcon={collapsed ? null : <Logout />}
            onClick={logout}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: collapsed ? 48 : 'auto',
              height: collapsed ? 48 : 44,
              border: '1px solid rgba(244, 67, 54, 0.5)',
              bgcolor: alpha('#f44336', 0.05),
              color: '#ff6b6b',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha('#f44336', 0.1),
                border: '1px solid rgba(244, 67, 54, 0.8)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
              }
            }}
          >
            {collapsed ? <Logout fontSize="small" /> : "Cerrar Sesión"}
          </Button>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;