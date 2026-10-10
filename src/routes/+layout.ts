// The app draws itself in the browser and nothing is rendered on a server: the
// one page is an empty shell that boots into the app, and the build writes that
// shell to index.html and, as the fallback, to 404.html (vite.config.ts).
export const ssr = false;
export const prerender = true;
