'use client';
import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'mymukhwas-auth';

/** Read the persisted auth snapshot from localStorage (client only). */
export function loadAuth() {
  if (typeof window === 'undefined') return { token: null, user: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

/** Persist the auth snapshot so sessions survive a reload. */
function saveAuth(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: state.token, user: state.user }),
    );
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null },
  reducers: {
    /** Accepts the login payload { accessToken, user }. */
    setAuth(state, action) {
      const { accessToken, user } = action.payload || {};
      state.token = accessToken ?? null;
      state.user = user ?? null;
      saveAuth(state);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      saveAuth(state);
    },
    /** Re-hydrate from localStorage on the client after mount. */
    hydrateAuth(state) {
      const { token, user } = loadAuth();
      state.token = token;
      state.user = user;
    },
  },
});

export const { setAuth, logout, hydrateAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

/* ---- selectors ---- */
export const selectToken = (s) => s.auth.token;
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.user?.role;
export const selectIsAuthenticated = (s) => !!s.auth.token;
