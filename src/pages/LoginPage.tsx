import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../slices/authSlice';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';
import api from '../api';
import Cookies from 'js-cookie';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call backend JWT login endpoint
      const res = await api.post('auth/token/', { username, password });
      const { access, refresh } = res.data;
      Cookies.set('access', access, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('refresh', refresh, { expires: 7, secure: true, sameSite: 'strict' });
      // Decode JWT to get user info (role, username)
      const payload = JSON.parse(atob(access.split('.')[1]));
      dispatch(login({ username: payload.username, role: payload.role, accessToken: access }));
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          E-Newspaper Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
