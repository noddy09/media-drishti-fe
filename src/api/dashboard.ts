import api from '../api';

export interface DashboardStats {
  total_uploads: number;
  total_clips: number;
  total_downloads: number;
  active_tags: number;
  top_tags: Array<{ tag_name: string; clip_count: number }>;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('dashboard/dashboard-stats/', { withCredentials: true });
  const data = response.data ?? {};
  return {
    total_uploads: Number(data.total_uploads ?? 0),
    total_clips: Number(data.total_clips ?? 0),
    total_downloads: Number(data.total_downloads ?? 0),
    active_tags: Number(data.active_tags ?? 0),
    top_tags: Array.isArray(data.top_tags) ? data.top_tags : [],
  };
};

export {};
