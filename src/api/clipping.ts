import api from '../api';

export const fetchClips = async () => {
  const response = await api.get('clipping/clips/', { withCredentials: true });
  return response.data;
};

export const createClip = async (clipData: any) => {
  const response = await api.post('clipping/clips/', clipData, { withCredentials: true });
  return response.data;
};

export const exportClips = async (tagIds: number[]) => {
  const response = await api.post('clipping/clips/export_clips/', { tag_ids: tagIds }, {
    responseType: 'blob',
    withCredentials: true,
  });
  return response.data;
};
