import api, { unwrapList } from '../api';

export const fetchDownloads = async () => {
  const response = await api.get('downloads/', { withCredentials: true });
  return unwrapList(response.data);
};

export const createDownload = async (downloadData: any) => {
  const response = await api.post('downloads/', downloadData, { withCredentials: true });
  return response.data;
};

export {};
