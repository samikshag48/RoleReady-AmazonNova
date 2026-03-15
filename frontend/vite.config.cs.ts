import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { 'content-script': resolve(__dirname, 'src/content-script.tsx') },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        name: 'RoleReadyCS',
        inlineDynamicImports: true,
      }
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});
