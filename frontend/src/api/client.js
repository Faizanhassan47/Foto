import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('fotos_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiError(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.error || error?.message || fallback;
}

export function resolveAssetUrl(value) {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
}

export default api;
