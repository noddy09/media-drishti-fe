import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Alert, Button, TextField } from '@mui/material';
import { fetchManualEntries, createManualEntry } from '../api/manualEntries';
import { fetchTags } from '../api/tagging';
import TagAutocomplete from '../components/TagAutocomplete';

const ManualEntryPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: [] as string[] });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const loadEntries = async () => {
    try {
      const data = await fetchManualEntries();
      if (Array.isArray(data)) {
        setEntries(data);
      } else if (data && Array.isArray(data.results)) {
        setEntries(data.results);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
    setLoadingTags(true);
    fetchTags().then((tags: any[]) => {
      setAllTags(tags.map(t => t.name));
      setLoadingTags(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagsChange = (tags: string[]) => {
    setForm({ ...form, tags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send tag names directly - backend will create new tags if needed
      await createManualEntry({ ...form, tags: form.tags, tenant: 'default' });
      setSuccess('Entry created!');
      setError(null);
      setForm({ title: '', content: '', tags: [] });
      loadEntries();
      // Refresh tags list to include any newly created tags
      fetchTags().then((tags: any[]) => setAllTags(tags));
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
          <TagAutocomplete
            options={allTags}
            value={form.tags}
            onChange={handleTagsChange}
            onSave={() => {}}
            loading={loadingTags}
            disabled={false}
          />
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
