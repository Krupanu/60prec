import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACCENT } from '../theme';

interface NavItem {
  label: string;
  path: string;
}

// Основной каркас приложения: шапка с меню по роли + контент страницы
export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Меню зависит от роли пользователя
  const navItems: NavItem[] = [{ label: 'Каталог туров', path: '/tours' }];
  if (user?.role === 'CLIENT') navItems.push({ label: 'Личный кабинет', path: '/profile' });
  if (user?.role === 'VEHICLE_OWNER') navItems.push({ label: 'Кабинет владельца ТС', path: '/owner' });
  if (user?.role === 'MANAGER') navItems.push({ label: 'Панель менеджера', path: '/admin' });

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  const goTo = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const navButtons = navItems.map((item) => (
    <Button
      key={item.path}
      color="inherit"
      onClick={() => navigate(item.path)}
      sx={{
        fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
        borderBottom: location.pathname.startsWith(item.path)
          ? `2px solid ${ACCENT}`
          : '2px solid transparent',
        borderRadius: 0,
      }}
    >
      {item.label}
    </Button>
  ));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <FlightTakeoffIcon sx={{ mr: 1, color: ACCENT }} />
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', fontWeight: 700, mr: 3 }}
            onClick={() => navigate('/')}
          >
            ТурФирма
          </Typography>
          {!isMobile && <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>{navButtons}</Box>}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}

          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {user?.firstName}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {user?.role === 'CLIENT' && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate('/profile');
                    }}
                  >
                    Личный кабинет
                  </MenuItem>
                )}
                {user?.role === 'VEHICLE_OWNER' && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate('/owner');
                    }}
                  >
                    Кабинет владельца ТС
                  </MenuItem>
                )}
                {user?.role === 'MANAGER' && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate('/admin');
                    }}
                  >
                    Панель менеджера
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Вход
              </Button>
              <Button
                variant="outlined"
                sx={{ color: ACCENT, borderColor: ACCENT, ml: 1, '&:hover': { borderColor: ACCENT } }}
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 700 }}>
            ТурФирма
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname.startsWith(item.path)}
                onClick={() => goTo(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          backgroundColor: '#112250',
          color: '#D9CBC2',
          mt: 'auto',
        }}
      >
        <Typography variant="body2">
          ТурФирма — программное средство для автоматизации работы тур-фирмы · Курсовой проект, БГУИР, 2026
        </Typography>
      </Box>
    </Box>
  );
}
