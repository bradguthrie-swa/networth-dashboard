import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// Base path for GitHub Pages deployment
// Update this to match your repository name (e.g., "/networth-dashboard/"), or use "/" for root domain or custom domain
export default defineConfig({
  plugins: [react()],
  base: "/networth-dashboard/",
});
