import { apiClient } from './config';

export interface EventsListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tab?: string;
  type?: string;
  location?: string;
  owner?: string;
  status?: string;
  registrationStatus?: string;
  attendanceMin?: number;
  attendanceMax?: number;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface EventMetricsParams {
  startDateFrom?: string;
  startDateTo?: string;
  tab?: string;
}

export const eventsAPI = {
  getEvents: async (params: EventsListParams) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getMetrics: async (params: EventMetricsParams) => {
    const response = await apiClient.get('/events/metrics', { params });
    return response.data;
  },

  createEvent: async (eventData: any) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  uploadFile: async (file: File, folder: string = 'events') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await apiClient.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  uploadMultipleFiles: async (files: File[], folder: string = 'events') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);
    const response = await apiClient.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },

  bulkArchive: async (eventIds: string[]) => {
    const response = await apiClient.post('/events/bulk-archive', { eventIds });
    return response.data;
  },

  bulkDelete: async (eventIds: string[]) => {
    const response = await apiClient.post('/events/bulk-delete', { eventIds });
    return response.data;
  },
};

export const savedViewsAPI = {
  getViews: async (module: string) => {
    const response = await apiClient.get('/saved-views', { params: { module } });
    return response.data;
  },

  createView: async (name: string, module: string, configuration: any) => {
    const response = await apiClient.post('/saved-views', { name, module, configuration });
    return response.data;
  },

  renameView: async (id: number, name: string) => {
    const response = await apiClient.put(`/saved-views/${id}`, { name });
    return response.data;
  },

  deleteView: async (id: number) => {
    const response = await apiClient.delete(`/saved-views/${id}`);
    return response.data;
  },
};
