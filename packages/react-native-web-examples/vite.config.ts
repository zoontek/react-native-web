import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' }
  }
});
