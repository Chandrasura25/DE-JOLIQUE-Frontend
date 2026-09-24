import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import '@fontsource-variable/inter';
import '@fontsource-variable/sora';
import './index.css';
import App from './App';
import { reloadForNewVersion } from './lib/chunkReload';

// A file from the previous deploy is gone (see lib/chunkReload.js): load the new version.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry "not found"/"forbidden" style errors, only transient ones.
      retry: (count, error) => count < 2 && (!error?.response || error.response.status >= 500),
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter Variable, sans-serif' } }} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
