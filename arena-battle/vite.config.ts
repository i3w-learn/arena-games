import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@state': path.resolve(__dirname, 'src/state'),
      '@systems': path.resolve(__dirname, 'src/systems'),
      '@events': path.resolve(__dirname, 'src/events'),
      '@rendering': path.resolve(__dirname, 'src/rendering'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  server: {
    open: true,
  },
});
