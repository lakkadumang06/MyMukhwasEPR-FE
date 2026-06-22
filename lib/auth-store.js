'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Auth state: token + current user, persisted to localStorage. */
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ accessToken, user }) => set({ token: accessToken, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'mymukhwas-auth' },
  ),
);
