import api from '../api';

export const fetchDashboardStats = async () => {
  const response = await api.get('dashboard/dashboard-stats/', { withCredentials: true });
  return response.data;
};

export {};
