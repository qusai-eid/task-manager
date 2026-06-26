import axios from 'axios';

// The live Railway backend base (no /api suffix here — added below)
const RAILWAY_BASE = 'https://task-manager-production-097d.up.railway.app';

/**
 * Resolves the API base URL for axios.
 * Rules (in priority order):
 *  1. VITE_API_URL env var — normalized to always end with /api
 *  2. Railway URL + /api  — used automatically in production builds
 *  3. /api               — used in local dev (Vite proxy forwards to localhost:5000)
 */
function resolveBaseURL(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    // Strip trailing slashes, then append /api if the caller omitted it
    const trimmed = envUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  return import.meta.env.PROD ? `${RAILWAY_BASE}/api` : '/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
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
