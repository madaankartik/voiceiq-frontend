import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (email, password, name) => {
  const response = await api.post('/auth/signup', { email, password, name });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const uploadCall = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await api.post('/upload/call', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getCalls = async () => {
  const response = await api.get('/calls');
  return response.data;
};

export const getCall = async (id) => {
  const response = await api.get(`/calls/${id}`);
  return response.data;
};

export const deleteCall = async (id) => {
  const response = await api.delete(`/calls/${id}`);
  return response.data;
};

export default api;
