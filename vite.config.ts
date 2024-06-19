import { defineConfig, searchForWorkspaceRoot } from "vite"
import react from "@vitejs/plugin-react"

// IMPORTANT: use the rollup wasm since vite use rollup for the build
// and esbuild during the dev and the rollup plugin seems to work
// for both dev and build
import wasmRollup from "@rollup/plugin-wasm"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasmRollup()],
  worker: {
    format: "es",
    plugins: () => [wasmRollup()],
  },
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(import.meta.url),
        "/Users/alireza/dev/admin/cornerstone3D.git.worktrees/beta/packages/dicomImageLoader/dist/esm/src/decodeImageFrameWorker.js",
        "/Users/alireza/dev/admin/cornerstone3D.git.worktrees/beta/node_modules/@cornerstonejs/codec-charls",
      ],
    },
  },
})
