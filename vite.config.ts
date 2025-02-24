import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"

/**
 * Vite configuration for the application.
 */
export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  plugins: [react(), viteCommonjs()],

  // seems like only required in dev mode, there is an issue with vite import.meta.url
  // in dev mode see https://github.com/vitejs/vite/issues/8427
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader", "@cornerstonejs/tools"],
    include: ["dicom-parser", "xmlbuilder2"],
  },
  worker: {
    format: "es",
  },
})
