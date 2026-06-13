import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Served from https://teizzzzz.github.io/todo/ on GitHub Pages.
  base: process.env.GITHUB_PAGES ? "/todo/" : "/",
  plugins: [react(), tailwindcss()],
});
