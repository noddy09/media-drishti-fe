import React, { useState } from 'react';
import PDFClipper from '../components/PDFClipper';
import TagAutocomplete from '../components/TagAutocomplete';
import { Container, Typography, Paper, Box, Button, Chip, Select, MenuItem, InputLabel, FormControl, List, ListItem, ListItemText, Divider } from '@mui/material';
import { fetchUploads } from '../api/uploads';
import { createClip } from '../api/clipping';
import { assignTagToClip } from '../api/tagging';
import { fetchTags } from '../api/tagging';

const ClippingPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [clip, setClip] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInputLoading, setTagInputLoading] = useState(false);
  const availableTags = ['Politics', 'Sports', 'Business', 'World', 'Local'];

  React.useEffect(() => {
    fetchUploads().then(setUploads);
    fetchTags().then((tags: any[]) => setAllTags(tags.map(t => t.name)));
  }, []);

  // Helper to get file type for selected file
  const getSelectedFileType = () => {
    const file = uploads.find((u) => u.file === selectedFile);
    return file?.file_type || 'pdf';
  };

  const handleClip = (clip: any) => {
    setClip(clip);
    setTagInputVisible(true);
  };

  const handleTagSave = async () => {
    if (!clip || !selectedFile || tags.length === 0) return;
    setTagInputLoading(true);
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      // Find upload object for selected file
      const fileObj = uploads.find((u) => u.file === selectedFile);
      // Create the clip
      const newClip = await createClip({
        upload: fileObj?.id,
        x: parseFloat(clip.x),
        y: parseFloat(clip.y),
        width: parseInt(clip.width),
        height: parseInt(clip.height),
        overlay_width: parseInt(clip.overlayWidth),
        overlay_height: parseInt(clip.overlayHeight),
        page_number: parseInt(clip.pageNumber),
        tags,
      });
      setSaveSuccess('Clip saved and tagged!');
      setClip(null);
      setTags([]);
      setTagInputVisible(false);
    } catch (err: any) {
      setSaveError('Failed to save clip.');
    } finally {
      setSaving(false);
      setTagInputLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, p: 2, height: '90vh', display: 'flex', flexDirection: 'row' }}>
      {/* Left: File List */}
      <Box sx={{ width: 240, height: '100%', bgcolor: '#f5f5f5', borderRadius: 2, mr: 2, overflowY: 'auto', p: 1 }}>
        <List>
          {uploads.map((u) => (
            <React.Fragment key={u.id}>
              <ListItem button selected={selectedFile === u.file} onClick={() => { setSelectedFile(u.file); setClip(null); setTags([]); setTagInputVisible(false); }}>
                <ListItemText primary={u.name} secondary={u.uploaded_at ? new Date(u.uploaded_at).toLocaleString() : ''} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
      {/* Center: Clipper and Tag UI */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flex: 1, mb: 2, minHeight: 400 }}>
          {selectedFile ? (
            <PDFClipper
              fileUrl={selectedFile}
              onClip={handleClip}
              fileType={getSelectedFileType()}
            />
          ) : (
            <Box sx={{ width: '100%', height: 300, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">Select a file to start clipping</Typography>
            </Box>
          )}
        </Box>
        {/* Tag Autocomplete UI appears after clipping */}
        {tagInputVisible && (
          <TagAutocomplete
            options={allTags}
            value={tags}
            onChange={setTags}
            onSave={handleTagSave}
            loading={tagInputLoading}
            disabled={saving}
          />
        )}
        {saveError && <Box sx={{ color: 'red', mt: 1 }}>{saveError}</Box>}
        {saveSuccess && <Box sx={{ color: 'green', mt: 1 }}>{saveSuccess}</Box>}
      </Box>
    </Container>
  );
};

export default ClippingPage;
