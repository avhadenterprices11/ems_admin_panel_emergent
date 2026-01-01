import { apiClient } from './config';

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  validateToken: async () => {
    const response = await apiClient.get('/auth/validate');
    return response.data;
  },
};
