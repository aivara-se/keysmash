import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";

// The app is one client-rendered page: an empty shell the browser boots into,
// served from static files with no server behind it. `prerender` writes the
// shell to index.html; `fallback` writes the same shell to 404.html, which is
// what GitHub Pages serves for a path it does not hold, so any URL opens the
// app rather than the host's own 404.
//
// BASE_PATH is set when the site is served under a path (a GitHub Pages
// project site is served under /<repository>/); it is empty for a site served
// from the domain root.
export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ pages: "build", assets: "build", fallback: "404.html", precompress: false }),
			paths: { base: (process.env.BASE_PATH ?? "") as "" | `/${string}` },
			version: { name: Date.now().toString() }
		})
	]
});
