import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { fetchDownloads } from '../api/downloads';

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<any[]>([]);

  useEffect(() => {
    fetchDownloads()
      .then(data => {
        if (Array.isArray(data)) {
          setDownloads(data);
        } else if (data && Array.isArray(data.results)) {
          setDownloads(data.results);
        } else {
          setDownloads([]);
        }
      })
      .catch(() => setDownloads([]));
  }, []);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Download Branded PDFs
        </Typography>
        <Box>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            [List of downloadable PDFs will appear here]
          </Typography>
          <List>
            {downloads.map((d) => (
              <ListItem key={d.id} divider>
                <ListItemText primary={d.upload} secondary={d.downloaded_by} />
                <Button variant="contained" color="primary" disabled>
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default DownloadsPage;
