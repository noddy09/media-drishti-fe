import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ mt: 6, p: 4 }}>
        <Typography variant="h3" gutterBottom>
          Dashboard
        </Typography>
        <Box>
          <Typography>
            Welcome to the E-Newspaper Clipping & Tagging Platform!
          </Typography>
          {/* Add dashboard widgets and navigation here */}
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
