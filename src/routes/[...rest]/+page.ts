/**
 * The app is one screen at any address. This route covers every path the app
 * does not hold of its own, so a bookmark or an installed icon opens the screen
 * rather than a not-found page; the build's fallback page serves it
 * (vite.config.ts).
 */
export const prerender = false;
