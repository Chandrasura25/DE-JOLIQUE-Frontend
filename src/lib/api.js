import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// The session lives in httpOnly cookies set by the API (which also refreshes it), so
// there is no token to attach here. withCredentials lets the cookies through when the
// API is on another origin (VITE_API_URL).
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  withCredentials: true,
});

let onUnauthorized = null;

/** Called when the API reports the session is gone (e.g. revoked on another device). */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && onUnauthorized) onUnauthorized(error);
  return Promise.reject(error);
});

/** A friendly message for any failed API call. Never exposes internals. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error.request && !error.response) return 'Unable to reach the server. Check your internet connection.';
  return error.message && !error.response ? error.message : fallback;
}

export const errorCode = (error) => error?.response?.data?.code;
