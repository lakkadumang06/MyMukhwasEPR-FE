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
      <Toaster 
        richColors 
        position="top-right" 
        toastOptions={{
          classNames: {
            toast: 'rounded-xl border border-slate-200 shadow-xl px-4 py-3 font-medium transition-all',
            title: 'text-sm',
            description: 'text-slate-500 text-sm',
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
          }
        }}
      />
    </Provider>
  );
}
