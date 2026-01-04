import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/helloworlds/",
  plugins: [react()],
  // Optimize memory usage for large projects
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize memory during build
    rollupOptions: {
      output: {
        // Manual chunk splitting to reduce memory pressure
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-reactflow': ['reactflow'],
        },
      },
    },
  },
  // Increase server memory limits
  server: {
    // Increase HMR (Hot Module Replacement) memory
    hmr: {
      overlay: true,
    },
  },
  // Optimize memory for development
  optimizeDeps: {
    // Increase memory for dependency pre-bundling
    force: false,
    // Include large dependencies
    include: ['three', 'react', 'react-dom', 'reactflow'],
  },
});
