import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  define: {
    'process.env.USE_LOCAL_MODEL': JSON.stringify('true'),
    'process.env.LOCAL_MODEL_TYPE': JSON.stringify('ollama'),
    'process.env.LOCAL_MODEL_URL': JSON.stringify('http://localhost:11434'),
    'process.env.LOCAL_MODEL_NAME': JSON.stringify('qwen2:7b'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
