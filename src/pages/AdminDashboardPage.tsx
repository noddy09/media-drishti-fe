import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Card, CardContent } from '@mui/material';
import { DashboardStats, fetchDashboardStats } from '../api/dashboard';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setLoadFailed(true));
  }, []);

  const statCards = stats ? [
    { name: 'Total uploads', value: stats.total_uploads },
    { name: 'Total clips', value: stats.total_clips },
    { name: 'Total downloads', value: stats.total_downloads },
    { name: 'Active tags', value: stats.active_tags },
  ] : [];

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {statCards.map((stat) => (
            <Box key={stat.name} sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 300 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{stat.name}</Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          {loadFailed && <Typography role="alert">Unable to load dashboard statistics.</Typography>}
        </Box>
        {stats && stats.top_tags.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Top tags</Typography>
            {stats.top_tags.map((tag) => (
              <Typography key={tag.tag_name}>
                {tag.tag_name}: {tag.clip_count} clips
              </Typography>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
