// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Additional Vite options to help with large vendor chunks and Vercel deployments
  vite: {
    build: {
      // Raise the chunk size warning limit (KB) to avoid non-actionable warnings during build
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'vendor_recharts';
              if (id.includes('@tanstack')) return 'vendor_tanstack';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
              return 'vendor_misc';
            }
          }
        }
      }
    }
  }
});
