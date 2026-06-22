'use client';
import axios from 'axios';
import { getAppStore } from './store/storeRef';
import { logout } from './store/authSlice';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

// Attach JWT on every request (token lives in the Redux auth slice).
api.interceptors.request.use((config) => {
  const token = getAppStore()?.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap { success, data } envelope; route 401 -> logout.
api.interceptors.response.use(
  (res) => (res.data?.data !== undefined ? res.data.data : res.data),
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      getAppStore()?.dispatch(logout());
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong';
    const err = new Error(message);
    err.status = status;
    return Promise.reject(err);
  },
);

// Convenience helpers (kept for any direct, non-RTK-Query usage).
export const apiGet = (url, params) => api.get(url, { params });
export const apiPost = (url, body) => api.post(url, body);
export const apiPatch = (url, body) => api.patch(url, body);
export const apiDelete = (url) => api.delete(url);
