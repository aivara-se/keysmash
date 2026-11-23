/** The app draws itself in the browser; nothing is rendered on a server. */
export const ssr = false;

/**
 * The build writes the one shell to index.html and, as the fallback, to
 * 404.html, which Pages serves for any path (vite.config.ts).
 */
export const prerender = true;
