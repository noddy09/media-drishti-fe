import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { fetchTags, createTag, assignTagToClip } from '../api/tagging';
import api from '../api';

interface Tag {
  id: number;
  name: string;
}

const TagManagementPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await fetchTags();
      setTags(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleAdd = async () => {
    if (!newTag.trim()) return;
    setSaving(true);
    try {
      await createTag({ name: newTag });
      setNewTag('');
      loadTags();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    try {
      await api.delete(`tagging/tags/${id}/`, { withCredentials: true });
      loadTags();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditId(tag.id);
    setEditValue(tag.name);
  };

  const handleEditSave = async () => {
    if (!editValue.trim() || editId === null) return;
    setSaving(true);
    try {
      await api.patch(`tagging/tags/${editId}/`, { name: editValue }, { withCredentials: true });
      setEditId(null);
      setEditValue('');
      loadTags();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Tag Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="New Tag"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            size="small"
            fullWidth
            disabled={saving}
          />
          <Button variant="contained" onClick={handleAdd} disabled={saving || !newTag.trim()}>
            Add
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
        ) : (
          <List>
            {tags.map(tag => (
              <ListItem key={tag.id} secondaryAction={
                editId === tag.id ? (
                  <>
                    <IconButton edge="end" color="primary" onClick={handleEditSave} disabled={saving}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton edge="end" color="inherit" onClick={() => { setEditId(null); setEditValue(''); }} disabled={saving}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge="end" color="primary" onClick={() => handleEdit(tag)} disabled={saving}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDelete(tag.id)} disabled={saving}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )
              }>
                {editId === tag.id ? (
                  <TextField
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    size="small"
                    fullWidth
                    disabled={saving}
                  />
                ) : (
                  <ListItemText primary={tag.name} />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default TagManagementPage;
