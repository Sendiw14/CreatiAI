import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { demoInterceptor } from './demoData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Demo mode interceptor — return mock data when in demo mode
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // If in demo mode, intercept failed requests and return mock data
    const isDemo = localStorage.getItem('creatiai-demo') === 'true';
    if (isDemo) {
      const config = error.config as AxiosRequestConfig;
      const mockResponse = demoInterceptor(config);
      if (mockResponse) return mockResponse;
    }

    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // Don't try to refresh in demo mode
      const isDemo = localStorage.getItem('creatiai-demo') === 'true';
      if (isDemo) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${API_BASE}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        if (original.headers) {
          (original.headers as Record<string, string>).Authorization = `Bearer ${data.accessToken}`;
        }
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
