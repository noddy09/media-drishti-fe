import api from '../api';

export const fetchTags = async () => {
  const response = await api.get('tags/', { withCredentials: true });
  return response.data;
};

export const createTag = async (tagData: any) => {
  const response = await api.post('tags/', tagData, { withCredentials: true });
  return response.data;
};

export const assignTagToClip = async (clipTagData: any) => {
  const response = await api.post('clip-tags/', clipTagData, { withCredentials: true });
  return response.data;
};

export {};
