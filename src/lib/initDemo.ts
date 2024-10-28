import initProviders from "./initProviders"
import initCornerstoneDICOMImageLoader from "./initCornerstoneDICOMImageLoader"
import { init as csRenderInit } from "@cornerstonejs/core"
import { init as csToolsInit } from "@cornerstonejs/tools"

export default async function initDemo() {
  initProviders()
  await csRenderInit()
  await csToolsInit()
  initCornerstoneDICOMImageLoader()
}
