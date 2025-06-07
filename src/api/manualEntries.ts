import api from '../api';

export const fetchManualEntries = async () => {
  const response = await api.get('manual-entries/', { withCredentials: true });
  return response.data;
};

export const createManualEntry = async (entryData: any) => {
  const response = await api.post('manual-entries/', entryData, { withCredentials: true });
  return response.data;
};

export {};
