import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const root = fileURLToPath(new URL('.', import.meta.url));

const aliases = {
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
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: aliases,
    },
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: resolve(root, 'main/index.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: aliases,
    },
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: resolve(root, 'preload/index.ts'),
      },
    },
  },
  renderer: {
    root: resolve(root, 'renderer'),
    plugins: [react()],
    resolve: {
      alias: aliases,
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: resolve(root, 'dist/renderer'),
      rollupOptions: {
        input: resolve(root, 'renderer/index.html'),
      },
    },
  },
});
