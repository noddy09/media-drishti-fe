import api from '../api';

export const fetchTags = async () => {
  const response = await api.get('tagging/tags/', { withCredentials: true });
  return response.data;
};

export const createTag = async (tagData: any) => {
  const response = await api.post('tagging/tags/', tagData, { withCredentials: true });
  return response.data;
};

export const assignTagToClip = async (clipTagData: any) => {
  const response = await api.post('tagging/clip-tags/', clipTagData, { withCredentials: true });
  return response.data;
};

export {};
