'use client';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api';

/**
 * Generic CRUD hooks for a REST resource (e.g. '/vendors').
 * List response is the paginated envelope { items, total, page, ... } OR a plain
 * array (for derived endpoints). Returns helpers used by CrudPage.
 */
export function useList(resource, params = {}) {
  return useQuery({
    queryKey: [resource, params],
    queryFn: () => api.get(resource, { params }).then((r) => r),
  });
}

export function useItem(resource, id) {
  return useQuery({
    queryKey: [resource, 'item', id],
    queryFn: () => api.get(`${resource}/${id}`).then((r) => r),
    enabled: !!id,
  });
}

export function useCreate(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post(resource, body).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success('Saved');
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdate(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => api.patch(`${resource}/${id}`, body).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success('Updated');
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRemove(resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`${resource}/${id}`).then((r) => r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.message),
  });
}
