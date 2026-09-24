import { lazy } from 'react';

// Every deploy renames the JavaScript files (content hashes) and removes the old
// ones. A tab opened before the deploy still asks for the old names when it lazy-
// loads a page, which fails. Reloading picks up the new version. The timestamp guard
// stops a reload loop if the file is genuinely unavailable (e.g. offline).
const KEY = 'jq-chunk-reload-at';
const GUARD_MS = 10_000;

export const isChunkLoadError = (err) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \S+ failed/i.test(
    String(err?.message || err),
  );

/** Reloads the page once per 10 seconds. Returns true if a reload was started. */
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < GUARD_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still reload, the browser will throttle any loop.
  }
  window.location.reload();
  return true;
}

/** React.lazy that reloads the app when a page's file is gone after a new deploy. */
export function lazyPage(factory) {
  return lazy(() =>
    factory().catch((err) => {
      // Never resolve while the page reloads, so no error screen flashes first.
      if (isChunkLoadError(err) && reloadForNewVersion()) return new Promise(() => {});
      throw err;
    }),
  );
}
