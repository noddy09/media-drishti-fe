import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Card, CardContent } from '@mui/material';
import { fetchDashboardStats } from '../api/dashboard';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => setStats([]));
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {stats.map((stat, idx) => (
            <Box key={idx} sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 300 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{stat.name}</Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
