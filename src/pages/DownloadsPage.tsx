import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button, Checkbox, FormControlLabel, FormGroup, CircularProgress, Alert } from '@mui/material';
import { fetchTags } from '../api/tagging';
import { exportClips } from '../api/clipping';
import api from '../api';

const DownloadsPage: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTags(true);
    fetchTags()
      .then((data) => {
        setTags(data);
        setLoadingTags(false);
      })
      .catch(() => {
        setTags([]);
        setLoadingTags(false);
      });
  }, []);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleDownload = async () => {
    if (selectedTags.length === 0) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await exportClips(selectedTags);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merged_clips.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e: any) {
      setError('Failed to export PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Export Clipped Regions by Tag
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Select Tags to Export Clips:</Typography>
          {loadingTags ? (
            <Box sx={{ my: 2 }}><CircularProgress size={24} /></Box>
          ) : (
            <FormGroup row>
              {tags.map((tag: any) => (
                <FormControlLabel
                  key={tag.id}
                  control={<Checkbox checked={selectedTags.includes(tag.id)} onChange={() => handleTagToggle(tag.id)} />}
                  label={tag.name}
                />
              ))}
            </FormGroup>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleDownload}
            disabled={selectedTags.length === 0 || downloading || loadingTags}
            aria-label="Download merged PDF of selected tags"
          >
            {downloading ? <CircularProgress size={24} /> : 'Download PDF'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </Paper>
    </Container>
  );
};

export default DownloadsPage;
