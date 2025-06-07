import api from '../api';

export const fetchDownloads = async () => {
  const response = await api.get('downloads/', { withCredentials: true });
  return response.data;
};

export const createDownload = async (downloadData: any) => {
  const response = await api.post('downloads/', downloadData, { withCredentials: true });
  return response.data;
};

export {};
