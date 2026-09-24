import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from './api';

export const useConfig = () =>
  useQuery({
    queryKey: ['config'],
    queryFn: async () => (await api.get('/config')).data.config,
    staleTime: 10 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
    staleTime: 5 * 60 * 1000,
  });

export const useProducts = (params, options = {}) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: async () => (await api.get('/products', { params })).data,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useProduct = (idOrSlug) =>
  useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => (await api.get(`/products/${encodeURIComponent(idOrSlug)}`)).data.product,
    enabled: Boolean(idOrSlug),
  });

export const useMyOrders = (page) =>
  useQuery({
    queryKey: ['my-orders', page],
    queryFn: async () => (await api.get('/orders/my-orders', { params: { page, limit: 10 } })).data,
    placeholderData: keepPreviousData,
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.order,
    enabled: Boolean(id),
  });
