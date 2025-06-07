import React from 'react';
import { Container, Typography, Paper, Box, Button, Chip } from '@mui/material';

const ClippingPage: React.FC = () => {
  // Placeholder for clipping tool UI
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Newspaper Clipping Tool
        </Typography>
        <Box sx={{ mb: 2 }}>
          {/* In production, show PDF/image viewer here */}
          <Box sx={{ width: '100%', height: 300, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">[PDF/Image Viewer Placeholder]</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle1">Selected Tags:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {/* Example tags */}
            <Chip label="Politics" color="primary" />
            <Chip label="Sports" color="secondary" />
          </Box>
          <Button variant="contained" color="primary">Save Clip</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ClippingPage;
