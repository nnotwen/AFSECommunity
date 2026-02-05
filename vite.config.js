import { defineConfig } from "vite";

export default defineConfig({
	base: "./", // important for GitHub Pages (relative paths)
	server: {
		port: 5173, // local dev server port
		open: true, // auto-open browser
	},
});
