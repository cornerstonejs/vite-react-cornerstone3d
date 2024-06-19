import { defineConfig, searchForWorkspaceRoot } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import wasmRollup from "@rollup/plugin-wasm"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), wasmRollup()],
  worker: {
    format: "es",
    plugins: () => [wasm(), wasmRollup()],
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
