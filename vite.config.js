import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/helloworlds/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-reactflow': ['reactflow'],
        },
      },
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    force: false,
    include: ['three', 'react', 'react-dom', 'reactflow'],
  },
});
