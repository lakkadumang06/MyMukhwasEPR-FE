'use client';
/**
 * Holds a lazy reference to the Redux store so non-React modules (e.g. the axios
 * interceptor in lib/api.js) can read auth state / dispatch actions without
 * importing the store directly — which would create a circular import:
 *   store -> apiSlice -> axiosBaseQuery -> api -> store
 * The store registers itself here once, after it has been configured.
 */
let appStore = null;

export function setAppStore(store) {
  appStore = store;
}

export function getAppStore() {
  return appStore;
}
