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
  build: {
    // Ensure compatibility with iOS Safari 14.5+ and modern mobile browsers
    target: ['es2020', 'safari14', 'chrome87', 'firefox78'],
  },
  server: {
    open: true,
  },
});
