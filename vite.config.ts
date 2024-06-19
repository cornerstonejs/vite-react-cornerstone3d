import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: [
      "@cornerstonejs/dicom-image-loader",
      "@cornerstonejs/codec-charls",
      "@cornerstonejs/codec-libjpeg-turbo-8bit",
      "@cornerstonejs/codec-openjpeg",
      "@cornerstonejs/codec-openjph",
    ],
  },
  assetsInclude: ["**/*.wasm"],
})
