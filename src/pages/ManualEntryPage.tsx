import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Alert, Button, TextField } from '@mui/material';
import { fetchManualEntries, createManualEntry } from '../api/manualEntries';

const ManualEntryPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  const loadEntries = async () => {
    try {
      const data = await fetchManualEntries();
      setEntries(data);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createManualEntry({ ...form, tenant: 'default' });
      setSuccess('Entry created!');
      setError(null);
      setForm({ title: '', content: '', tags: '' });
      loadEntries();
    } catch {
      setError('Failed to create entry.');
      setSuccess(null);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Manual News Entry
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField name="title" value={form.title} onChange={handleChange} label="Title" fullWidth margin="normal" required />
          <TextField name="content" value={form.content} onChange={handleChange} label="Content" fullWidth margin="normal" multiline rows={6} required />
          <TextField name="tags" value={form.tags} onChange={handleChange} label="Tags (comma separated)" fullWidth margin="normal" />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Manual Entries</Typography>
          <List>
            {entries.map((entry) => (
              <ListItem key={entry.id} divider>
                <ListItemText primary={entry.title} secondary={entry.tags} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default ManualEntryPage;
