import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { vitePluginCornerstoneWasm } from "./vite-plugin-cornerstone-wasm"

/**
 * Vite configuration for the application.
 *
 * @remarks
 * This configuration is mostly standard Vite + React setup, with specific accommodations for:
 * - WASM decoders used by Cornerstone libraries
 * - DICOM parser which currently uses CommonJS format (planned migration to ESM)
 *
 * @description
 * Key configuration points:
 * - Uses vite-plugin-commonjs to handle the DICOM parser's CommonJS format
 * - Configures worker format as ES modules
 * - Excludes Cornerstone CODEC packages from dependency optimization to handle WASM properly
 * - Explicitly includes dicom-parser in optimization
 * - Ensures WASM files are properly handled as assets
 *
 * @example
 * To use additional WASM decoders, add them to the optimizeDeps.exclude array:
 * ```ts
 * optimizeDeps: {
 *   exclude: [
 *     "@cornerstonejs/codec-new-decoder",
 *     // ... existing codecs
 *   ]
 * }
 * ```
 */
export default defineConfig({
  base: '/subpath/',
  plugins: [
    react(),
    // for dicom-parser
    viteCommonjs(),
    // Optional: pass wasmBasePath to override WASM loading path (e.g. for subpath deployment).
    // When not set, use setConfiguration({ wasmBasePath: import.meta.env.BASE_URL }) in main.tsx.
    vitePluginCornerstoneWasm({ wasmBasePath: '' }),
  ],
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
  build: {
    minify: false,
  },
  worker: {
    format: 'es',
    rollupOptions: {
      external: ['@icr/polyseg-wasm'],
    },
  },
});
