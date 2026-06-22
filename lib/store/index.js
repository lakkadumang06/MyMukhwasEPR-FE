'use client';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './apiSlice';
import { authReducer, loadAuth } from './authSlice';
import { setAppStore } from './storeRef';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
  // On the client this reads the persisted session synchronously so route
  // guards see the token on the very first render (matches old behaviour).
  preloadedState: { auth: loadAuth() },
});

// Enable refetchOnFocus / refetchOnReconnect behaviour for RTK Query.
setupListeners(store.dispatch);

// Register the store so the axios interceptor can reach auth state (see storeRef).
setAppStore(store);
