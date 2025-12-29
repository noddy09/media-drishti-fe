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

export const fetchClientTags = async () => {
  const response = await api.get('tagging/client-tags/', { withCredentials: true });
  return response.data;
};

export const createClientTag = async (clientTagData: any) => {
  const response = await api.post('tagging/client-tags/', clientTagData, { withCredentials: true });
  return response.data;
};

export const deleteClientTag = async (id: number) => {
  await api.delete(`tagging/client-tags/${id}/`, { withCredentials: true });
};

export {};
