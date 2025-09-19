// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    // COOP/COEP for SharedArrayBuffer in dev/preview
    {
      name: 'isolation',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      },
    },
  ],

  // IMPORTANT: let Vite treat .wasm as assets and do NOT pre-bundle sqlite-wasm.
  assetsInclude: ['**/*.wasm'],

  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },

  // Workers are ES modules by default; keep explicit for clarity.
  worker: {
    format: 'es',
  },

  // Also add headers for `vite preview` (prod-like serve)
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
