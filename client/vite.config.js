import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    // Forward /api calls to the Express server during development (no CORS needed).
    proxy: { "/api": "http://localhost:4000" },
  },
  preview: {
    port: 4173,
    proxy: { "/api": "http://localhost:4000" },
  },
});
