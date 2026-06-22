'use client';
import { api } from '@/lib/api';

/**
 * RTK Query baseQuery backed by our shared axios instance (lib/api.js).
 * Reusing that instance means every request/response still flows through the
 * existing interceptors (JWT attach, { success, data } unwrap, 401 -> logout),
 * so RTK Query inherits the exact same behaviour as the rest of the app.
 *
 * Args: { url, method = 'get', body, params }
 * The axios response interceptor already returns the unwrapped payload, so
 * `res` here IS the data.
 */
export const axiosBaseQuery =
  () =>
  async ({ url, method = 'get', body, params }) => {
    try {
      const data = await api({ url, method, data: body, params });
      return { data };
    } catch (error) {
      // The response interceptor rejects with a normalized Error(message).
      return {
        error: {
          status: error?.status || error?.response?.status,
          message: error?.message || 'Something went wrong',
        },
      };
    }
  };
