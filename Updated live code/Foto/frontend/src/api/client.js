import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('Tasveer_Hubs_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiError(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.error || error?.message || fallback;
}

export function resolveAssetUrl(value, options = {}) {
  if (!value) {
    return '';
  }

  const isCloudinary = value.includes('res.cloudinary.com');

  if (isCloudinary) {
    // Basic Cloudinary transformation logic
    // Format: .../upload/[transformations]/v123/...
    const parts = value.split('/upload/');
    if (parts.length === 2) {
      let transform = 'f_auto,q_auto'; // Default best format and quality

      if (options.width) transform += `,w_${options.width}`;
      if (options.height) transform += `,h_${options.height}`;
      if (options.crop) transform += `,c_${options.crop}`;
      if (options.gravity) transform += `,g_${options.gravity}`;
      if (options.blur) transform += `,e_blur:${options.blur}`;

      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
}

export default api;
