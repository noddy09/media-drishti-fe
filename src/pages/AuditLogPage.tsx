import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText } from '@mui/material';
import { fetchAuditLogs } from '../api/auditlog';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAuditLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Audit Log
        </Typography>
        <Box>
          <List>
            {logs.map((log) => (
              <ListItem key={log.id} divider>
                <ListItemText
                  primary={log.action + (log.user ? ` by ${log.user}` : '')}
                  secondary={log.timestamp}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuditLogPage;
