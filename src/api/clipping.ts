import api from '../api';

export const fetchClips = async () => {
  const response = await api.get('clipping/clips/', { withCredentials: true });
  return response.data;
};

export const createClip = async (clipData: any) => {
  const response = await api.post('clipping/clips/', clipData, { withCredentials: true });
  return response.data;
};

export {};
