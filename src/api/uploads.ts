import api, { unwrapList } from '../api';

export const uploadFile = async (formData: FormData) => {
  const response = await api.post('uploads/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return response.data;
};

export const fetchUploads = async () => {
  const response = await api.get('uploads/', { withCredentials: true });
  return unwrapList(response.data);
};

export {};
