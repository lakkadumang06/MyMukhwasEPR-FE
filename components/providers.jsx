'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/lib/store';
import { hydrateAuth } from '@/lib/store/authSlice';
import { RouteProgress } from '@/components/common/Loader';

export function Providers({ children }) {
  // Re-hydrate persisted auth from localStorage once on the client. (Initial
  // server render starts logged-out to avoid hydration mismatches.)
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return (
    <Provider store={store}>
      <RouteProgress />
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
