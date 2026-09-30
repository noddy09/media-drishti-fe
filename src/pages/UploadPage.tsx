import React, { useRef, useState } from 'react';
import { Container, Typography, Paper, Box, Button, Input, List, ListItem, ListItemText, Alert, TextField } from '@mui/material';
import { uploadFile, fetchUploads } from '../api/uploads';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('file_type', files[0].type.startsWith('image') ? 'image' : 'pdf');
      formData.append('tenant', 'default'); // Replace with actual tenant logic
      formData.append('name', fileName || files[0].name); // Pass user-provided name or fallback to original
      try {
        await uploadFile(formData);
        setSuccess('File uploaded successfully!');
        setError(null);
        setFileName('');
        loadUploads(); 
      } catch (err: any) {
        setError('Upload failed.');
        setSuccess(null);
      }
    }
  };

  const loadUploads = async () => {
    try {
      const data = await fetchUploads();
      setUploads(data);
    } catch {
      setUploads([]);
    }
  };

  React.useEffect(() => {
    loadUploads();
  }, []);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload Newspaper PDF/Image
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          <TextField
            label="File Name"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            sx={{ mb: 2 }}
            fullWidth
            placeholder="Enter a name for the file (optional)"
          />
          <Input
            type="file"
            inputRef={fileInputRef}
            onChange={handleFileChange}
            inputProps={{ accept: '.pdf,image/*' }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Uploaded Files</Typography>
          <List>
            {uploads.map((u) => (
              <ListItem key={u.id} divider>
                <ListItemText
                  primary={u.name ? `${u.name}` : u.file}
                  secondary={`Type: ${u.file_type} | Uploaded: ${u.uploaded_at ? new Date(u.uploaded_at).toLocaleString() : ''}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadPage;
