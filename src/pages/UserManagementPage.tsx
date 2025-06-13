import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean; // <-- add this line
  role?: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'employee' });

  const fetchUsers = async () => {
    const res = await api.get('users/users/');
    setUsers(res.data.results || res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpen = (user?: User) => {
    setEditUser(user || null);
    setForm(user ? { username: user.username, email: user.email, password: '', role: user.role || 'employee' } : { username: '', email: '', password: '', role: 'employee' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Fix: handleChange for both TextField and Select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    if (editUser) {
      await api.put(`users/users/${editUser.id}/`, { ...form });
    } else {
      await api.post('users/users/', { ...form });
    }
    setOpen(false);
    fetchUsers();
  };

  const handleToggleActive = async (user: User) => {
    await api.patch(`users/users/${user.id}/`, { is_active: !user.is_active });
    fetchUsers();
  };

  return (
    <Box sx={{ mt: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>User Management</Typography>
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Add User</Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.is_staff ? (user.is_superuser ? 'admin' : 'employee') : 'client'} color={user.is_superuser ? 'primary' : user.is_staff ? 'secondary' : 'default'} />
                </TableCell>
                <TableCell>
                  <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(user)}>Edit</Button>
                  <Button size="small" onClick={() => handleToggleActive(user)}>{user.is_active ? 'Deactivate' : 'Activate'}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Username" name="username" value={form.username} onChange={handleChange} fullWidth />
            <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField margin="dense" label="Password" name="password" value={form.password} onChange={handleChange} type="password" fullWidth />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} label="Role" onChange={handleChange as any}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="client">Client</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserManagementPage;
