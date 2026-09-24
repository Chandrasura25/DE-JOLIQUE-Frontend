import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useAuthProviders } from './GoogleButton';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
// Pages where a sign-in prompt would get in the way.
const QUIET_PATHS = ['/reset-password', '/payment/callback'];

let gsiPromise;
function loadGsi() {
  gsiPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      gsiPromise = undefined;
      reject(new Error('Google sign-in could not load.'));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

/**
 * Google One Tap for signed-out visitors. Each prompt uses a fresh nonce from the API
 * (Google embeds its hash in the ID token), and the API redeems the token server-side,
 * so no Google or Supabase token is kept in the browser.
 */
export default function GoogleOneTap() {
  const status = useAuthStore((s) => s.status);
  const signedIn = useAuthStore((s) => Boolean(s.user));
  const signInWithOneTap = useAuthStore((s) => s.signInWithOneTap);
  const { data: providers } = useAuthProviders();
  const { pathname } = useLocation();
  const clientId = providers?.googleOneTapClientId;
  const quiet = QUIET_PATHS.includes(pathname);

  useEffect(() => {
    if (!clientId || status !== 'ready' || signedIn || quiet) return undefined;
    let cancelled = false;

    (async () => {
      const google = await loadGsi();
      const { data } = await api.get('/auth/google/one-tap/nonce');
      if (cancelled) return;
      google.accounts.id.initialize({
        client_id: clientId,
        nonce: data.nonce,
        context: 'signin',
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
        callback: async ({ credential }) => {
          try {
            const user = await signInWithOneTap(credential);
            toast.success(`Welcome${user.name ? `, ${user.name.split(' ')[0]}` : ''}!`);
          } catch (err) {
            toast.error(err.message);
          }
        },
      });
      google.accounts.id.prompt();
    })().catch(() => {
      // One Tap is a convenience; the regular Google button still works.
    });

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [clientId, status, signedIn, quiet, signInWithOneTap]);

  return null;
}
