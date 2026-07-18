import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: resolve(root, 'renderer'),
  plugins: [react()],
  resolve: {
    alias: {
      '@desktop': root,
      '@renderer': resolve(root, 'renderer'),
      '@components': resolve(root, 'components'),
      '@layouts': resolve(root, 'layouts'),
      '@pages': resolve(root, 'pages'),
      '@hooks': resolve(root, 'hooks'),
      '@contexts': resolve(root, 'contexts'),
      '@stores': resolve(root, 'stores'),
      '@styles': resolve(root, 'styles'),
      '@services': resolve(root, 'services'),
      '@utils': resolve(root, 'utils'),
      '@types': resolve(root, 'types'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(root, 'dist/renderer'),
    rollupOptions: {
      input: resolve(root, 'renderer/index.html'),
    },
  },
});
