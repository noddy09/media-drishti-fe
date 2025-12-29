import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../api';
import { fetchTags as fetchTagsAPI, createClientTag, deleteClientTag } from '../api/tagging';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean; // <-- add this line
  role?: string;
  client_tags?: ClientTag[];
}

interface Tag {
  id: number;
  name: string;
}

interface ClientTag {
  id: number;
  client: number;
  tag: Tag;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | ''>('');

  const fetchUsers = async () => {
    const res = await api.get('users/users/');
    const data = res.data.results || res.data;
    setUsers(data);
    return data;
  };

  const loadTags = async () => {
    const tagsRes = await fetchTagsAPI();
    setTags(tagsRes.results || tagsRes);
  };

  useEffect(() => { 
    fetchUsers(); 
    loadTags();
  }, []);

  const handleOpen = (user?: User) => {
    setEditUser(user || null);
    setForm(user ? { username: user.username, email: user.email, password: '', role: user.role || 'employee' } : { username: '', email: '', password: '', role: 'employee' });
    setError('');
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
    try {
      setError('');
      if (editUser) {
        await api.put(`users/users/${editUser.id}/`, { ...form });
      } else {
        await api.post('users/users/', { ...form });
      }
      setOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data) {
        const errors = Object.values(err.response.data).flat().join(', ');
        setError(errors);
      } else {
        setError('An error occurred');
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    await api.patch(`users/users/${user.id}/`, { is_active: !user.is_active });
    fetchUsers();
  };

  const handleManageTags = (user: User) => {
    setSelectedClient(user);
    setTagDialogOpen(true);
  };

  const handleAddTag = async () => {
    if (selectedTag && selectedClient) {
      await createClientTag({ client: selectedClient.id, tag: selectedTag });
      const refreshed = await fetchUsers();
      const updated = refreshed.find((u: User) => u.id === selectedClient.id) || null;
      setSelectedClient(updated);
      setSelectedTag('');
    }
  };

  const handleRemoveTag = async (clientTagId: number) => {
    await deleteClientTag(clientTagId);
    const refreshed = await fetchUsers();
    const updated = selectedClient ? refreshed.find((u: User) => u.id === selectedClient.id) : null;
    setSelectedClient(updated || null);
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
                  {!user.is_staff && !user.is_superuser && <Button size="small" onClick={() => handleManageTags(user)}>Manage Tags</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogContent>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
        <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manage Tags for {selectedClient?.username}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Assigned Tags</Typography>
            {(selectedClient?.client_tags || []).map(ct => (
              <Chip key={ct.id} label={ct.tag.name} onDelete={() => handleRemoveTag(ct.id)} sx={{ mr: 1, mb: 1 }} />
            ))}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Add Tag</InputLabel>
                <Select value={selectedTag} label="Add Tag" onChange={(e) => setSelectedTag(e.target.value as number)}>
                  {tags.filter(tag => !(selectedClient?.client_tags || []).some(ct => ct.tag.id === tag.id)).map(tag => (
                    <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddTag} disabled={!selectedTag}>Add Tag</Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTagDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserManagementPage;
