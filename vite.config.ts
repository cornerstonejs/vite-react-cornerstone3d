import { defineConfig, searchForWorkspaceRoot } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  worker: {
    format: "es",
    plugins: () => [wasm()],
  },
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(import.meta.url),
        "/Users/alireza/dev/admin/cornerstone3D.git.worktrees/beta/packages/dicomImageLoader/dist/esm/src/decodeImageFrameWorker.js",
        "/Users/alireza/dev/admin/cornerstone3D.git.worktrees/beta/node_modules/@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm",
      ],
    },
  },
  // optimizeDeps: {
  //   exclude: [
  //     "@cornerstonejs/codec-charls",
  //     "@cornerstonejs/codec-libjpeg-turbo-8bit",
  //     "@cornerstonejs/codec-openjpeg",
  //     "@cornerstonejs/codec-openjph",
  //   ],
  // },
  // build: {
  //   rollupOptions: {
  //     external: ["@icr/polyseg-wasm/dist/ICRPolySeg.wasm"],
  //   },
  // },
})
