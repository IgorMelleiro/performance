import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupsIcon from '@mui/icons-material/Groups';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROLE_LABELS, ROLES } from '@/auth/roles';
import { usePermissions } from '@/hooks/usePermissions';
import { useLayoutStore } from '@/store/layoutStore';
import { useAuthStore } from '@/store/authStore';

const drawerWidth = 260;

const MENUS_BY_ROLE = {
  [ROLES.RH]: [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Colaboradores', path: '/colaboradores', icon: <PeopleIcon /> },
    { label: 'Times', path: '/times', icon: <GroupsIcon /> },
    { label: 'Avaliações', path: '/avaliacoes', icon: <AssignmentIcon /> },
    { label: 'Templates', path: '/templates', icon: <DescriptionIcon /> },
    { label: 'Configurações', path: '/configuracoes', icon: <SettingsIcon /> },
  ],
  [ROLES.GERENTE]: [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Minha Equipe', path: '/colaboradores', icon: <PeopleIcon /> },
    { label: 'Avaliações', path: '/avaliacoes', icon: <AssignmentIcon /> },
  ],
  [ROLES.FUNCIONARIO]: [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Minhas Avaliações', path: '/avaliacoes', icon: <AssignmentIcon /> },
    { label: 'Autoavaliação', path: '/autoavaliacao', icon: <AssignmentIndIcon /> },
    { label: 'Meu Perfil', path: '/colaboradores', icon: <PeopleIcon /> },
  ],
};

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { role } = usePermissions();

  const menuItems = MENUS_BY_ROLE[role] || MENUS_BY_ROLE[ROLES.RH];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Avaliação de Performance
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name || 'Usuário'}
            {user?.role ? ` · ${ROLE_LABELS[user.role] || user.role}` : ''}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 64,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={`${item.path}-${item.label}`}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              sx={{
                '&.active': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
