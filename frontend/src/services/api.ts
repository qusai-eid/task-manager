import axios from 'axios';

// The live Railway backend URL
const RAILWAY_API = 'https://task-manager-production-097d.up.railway.app/api';

// Resolution order:
//   1. VITE_API_URL env var (set in Vercel dashboard if you ever switch backends)
//   2. Railway URL in production builds (import.meta.env.PROD = true)
//   3. /api in local dev (Vite proxy forwards it to localhost:5000)
const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? RAILWAY_API : '/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
