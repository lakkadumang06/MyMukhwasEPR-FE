'use client';
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

/**
 * Single source of truth for every HTTP call in the app.
 *
 * Most screens are generic REST resources, so instead of declaring one endpoint
 * per resource we expose a small set of *parameterized* endpoints:
 *   - getList / getOne / createItem / updateItem / removeItem  -> CRUD resources
 *   - getRaw / rawMutation                                     -> derived/custom routes
 *   - login                                                    -> auth
 *
 * Caching & invalidation use two tag families:
 *   { type: 'Resource', id: '<resource path>' }  e.g. '/vendors'
 *   { type: 'Raw',      id: '<url>' }            e.g. '/dashboard/alerts'
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Resource', 'Raw'],
  endpoints: (builder) => ({
    /* ---- generic REST resource CRUD ---- */
    getList: builder.query({
      query: ({ resource, params } = {}) => ({ url: resource, params }),
      providesTags: (result, error, { resource }) => [
        { type: 'Resource', id: resource },
      ],
    }),
    getOne: builder.query({
      query: ({ resource, id }) => ({ url: `${resource}/${id}` }),
      providesTags: (result, error, { resource, id }) => [
        { type: 'Resource', id: `${resource}/${id}` },
      ],
    }),
    createItem: builder.mutation({
      query: ({ resource, body }) => ({ url: resource, method: 'post', body }),
      invalidatesTags: (result, error, { resource }) => [
        { type: 'Resource', id: resource },
      ],
    }),
    updateItem: builder.mutation({
      query: ({ resource, id, body }) => ({
        url: `${resource}/${id}`,
        method: 'patch',
        body,
      }),
      invalidatesTags: (result, error, { resource }) => [
        { type: 'Resource', id: resource },
      ],
    }),
    removeItem: builder.mutation({
      query: ({ resource, id }) => ({
        url: `${resource}/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (result, error, { resource }) => [
        { type: 'Resource', id: resource },
      ],
    }),

    /* ---- arbitrary / derived endpoints ---- */
    getRaw: builder.query({
      query: ({ url, params } = {}) => ({ url, params }),
      providesTags: (result, error, { url }) => [{ type: 'Raw', id: url }],
    }),
    rawMutation: builder.mutation({
      query: ({ url, method = 'post', body, params }) => ({
        url,
        method,
        body,
        params,
      }),
      // Pass `invalidates: [{ type, id }, ...]` to refresh related caches.
      invalidatesTags: (result, error, arg) => arg?.invalidates || [],
    }),

    /* ---- auth ---- */
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'post',
        body: credentials,
      }),
    }),
  }),
});

export const {
  useGetListQuery,
  useGetOneQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useGetRawQuery,
  useRawMutationMutation,
  useLoginMutation,
} = apiSlice;
