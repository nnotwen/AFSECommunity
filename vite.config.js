import { defineConfig } from "vite";

export default defineConfig({
	base: "./", // important for GitHub Pages (relative paths)
	server: {
		port: 5173, // local dev server port
		open: true, // auto-open browser
	},
	build: {
		target: "es2015", // or es2019 for newer iOS
	},
});
