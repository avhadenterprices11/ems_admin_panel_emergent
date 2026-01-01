import { apiClient } from '../api/config';

export const makeGetRequest = async (url, params = {}) => {
  return await apiClient.get(url, { params });
};

export const makePostRequest = async (url, data = {}) => {
  return await apiClient.post(url, data);
};

export const makePutRequest = async (url, data = {}) => {
  return await apiClient.put(url, data);
};

export const makeDeleteRequest = async (url) => {
  return await apiClient.delete(url);
};
