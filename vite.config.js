import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.jsx'],
      refresh: true,
    }),
    react(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    https: false, // Force HTTP instead of HTTPS
    cors: true,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    // Force new filename by including timestamp
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(new Date().getTime()),
    __BUILD_ID__: JSON.stringify(Math.random().toString(36).substr(2, 9)),
  },
});
