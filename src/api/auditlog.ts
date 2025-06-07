import api from '../api';

export const fetchAuditLogs = async () => {
  const response = await api.get('auditlog/', { withCredentials: true });
  return response.data;
};

export {};
