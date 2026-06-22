'use client';
import { toast } from 'sonner';
import { apiSlice } from './store/apiSlice';

/**
 * Generic CRUD hooks for a REST resource (e.g. '/vendors'), implemented on top
 * of the central RTK Query api slice. The public shape is kept intentionally
 * compatible with the previous React Query implementation:
 *   - list/item hooks return { data, isLoading, error, ... }
 *   - mutation hooks return { mutateAsync, isPending }
 * so screens consuming these helpers need no changes.
 */
export function useList(resource, params = {}) {
  return apiSlice.useGetListQuery({ resource, params });
}

export function useItem(resource, id) {
  return apiSlice.useGetOneQuery({ resource, id }, { skip: !id });
}

/** Arbitrary GET for derived / non-CRUD routes (dashboard, reports, stock…). */
export function useGet(url, params = {}, options = {}) {
  return apiSlice.useGetRawQuery({ url, params }, options);
}

function withToast(trigger, successMsg) {
  return async (arg) => {
    try {
      const result = await trigger(arg).unwrap();
      if (successMsg) toast.success(successMsg);
      return result;
    } catch (e) {
      toast.error(e?.message || 'Something went wrong');
      throw e;
    }
  };
}

export function useCreate(resource) {
  const [trigger, state] = apiSlice.useCreateItemMutation();
  return {
    mutateAsync: withToast((body) => trigger({ resource, body }), 'Saved'),
    isPending: state.isLoading,
  };
}

export function useUpdate(resource) {
  const [trigger, state] = apiSlice.useUpdateItemMutation();
  return {
    mutateAsync: withToast(
      ({ id, body }) => trigger({ resource, id, body }),
      'Updated',
    ),
    isPending: state.isLoading,
  };
}

export function useRemove(resource) {
  const [trigger, state] = apiSlice.useRemoveItemMutation();
  return {
    mutateAsync: withToast((id) => trigger({ resource, id }), 'Deleted'),
    isPending: state.isLoading,
  };
}

/**
 * Custom mutation against an arbitrary URL (e.g. record-payment, mark-attendance).
 * `invalidates` is a list of RTK Query tags to refresh, e.g.
 *   [{ type: 'Resource', id: '/credit-udhaar' }]
 *   [{ type: 'Raw', id: '/team/attendance' }]
 */
export function useRawMutation() {
  const [trigger, state] = apiSlice.useRawMutationMutation();
  return {
    trigger: (arg) => trigger(arg).unwrap(),
    isPending: state.isLoading,
  };
}
