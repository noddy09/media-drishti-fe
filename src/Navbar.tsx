import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { logout } from './slices/authSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
          E-News Platform
        </Typography>
        {isAuthenticated && user ? (
          <>
            <Box sx={{ mr: 2 }}>Hi, {user.username} ({user.role})</Box>
            {user.role === 'admin' && <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>}
            {user.role === 'admin' && <Button color="inherit" component={RouterLink} to="/upload">Upload</Button>}
            {(user.role === 'admin' || user.role === 'employee') && <Button color="inherit" component={RouterLink} to="/manual-entry">Manual Entry</Button>}
            {(user.role === 'admin' || user.role === 'employee') && <Button color="inherit" component={RouterLink} to="/clipping">Clipping</Button>}
            <Button color="inherit" component={RouterLink} to="/downloads">Downloads</Button>
            {user.role === 'admin' && <Button color="inherit" component={RouterLink} to="/auditlog">Audit Log</Button>}
            {/* Only show Admin Dashboard and User Management for admin users */}
            {user.role === 'admin' && (
              <>
                <Button color="inherit" component={RouterLink} to="/admin-dashboard">Admin Dashboard</Button>
                <Button color="inherit" component={RouterLink} to="/user-management">User Management</Button>
              </>
            )}
            {user.role === 'admin' && <Button color="inherit" component={RouterLink} to="/tag-management">Tag Management</Button>}
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
