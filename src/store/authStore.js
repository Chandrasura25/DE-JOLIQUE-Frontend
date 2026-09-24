import { create } from 'zustand';
import { API_BASE, api, errorMessage, setUnauthorizedHandler } from '../lib/api';

/**
 * Auth state. The API owns the Supabase session (tokens in httpOnly cookies, refreshed
 * server-side); the browser only ever sees the store profile (name, phone, role).
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'loading', // loading | ready
  profileError: null,

  async init() {
    if (get()._initialised) return;
    set({ _initialised: true });
    setUnauthorizedHandler(() => set({ user: null }));
    await get().loadProfile();
    set({ status: 'ready' });
  },

  async loadProfile() {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, profileError: null });
      return data.user;
    } catch (err) {
      // 401 just means "not signed in".
      set({ user: null, profileError: err.response?.status === 401 ? null : errorMessage(err) });
      return null;
    }
  },

  setUser(user) {
    set({ user });
  },

  async signIn(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      set({ user: data.user, profileError: null });
      return data.user;
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  },

  /** Google One Tap: the API redeems Google's ID token (with its nonce cookie) for a session. */
  async signInWithOneTap(credential) {
    try {
      const { data } = await api.post('/auth/google/one-tap', { credential });
      set({ user: data.user, profileError: null });
      return data.user;
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  },

  /** Full-page redirect to Google (via the API and Supabase Auth); comes back signed in. */
  signInWithGoogle(next = '/account') {
    window.location.assign(`${API_BASE}/auth/google?next=${encodeURIComponent(next)}`);
  },

  /** Returns { needsConfirmation } — true when the project requires email confirmation. */
  async signUp({ name, email, phone, password }, next) {
    try {
      const { data } = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        next,
      });
      if (data.user) set({ user: data.user, profileError: null });
      return { needsConfirmation: data.needsConfirmation };
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  },

  async signOut() {
    await api.post('/auth/logout').catch(() => {});
    set({ user: null });
  },

  async requestPasswordReset(email) {
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  },

  async setNewPassword(password) {
    try {
      const { data } = await api.post('/auth/reset-password', { password });
      set({ user: data.user });
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  },
}));
