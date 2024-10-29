import { useEffect,  useRef } from "react"
import { createImageIdsAndCacheMetaData, initDemo } from "./lib"
import { RenderingEngine, Enums, type Types, volumeLoader, cornerstoneStreamingImageVolumeLoader } from "@cornerstonejs/core"
import * as cornerstone from "@cornerstonejs/core"

volumeLoader.registerUnknownVolumeLoader(
  cornerstoneStreamingImageVolumeLoader 
)


function App() {
  const elementRef = useRef<HTMLDivElement>(null)
  const running = useRef(false)

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return
      }
      running.current = true
      await initDemo()

      // Get Cornerstone imageIds and fetch metadata into RAM
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      })

      // Instantiate a rendering engine
      const renderingEngineId = "myRenderingEngine"
      const renderingEngine = new RenderingEngine(renderingEngineId)
      const viewportId = "CT_STACK"

      // const viewportInput = {
      //   viewportId,
      //   type: Enums.ViewportType.STACK,
      //   element: elementRef.current,
      //   defaultOptions: {
      //     background: [0.2, 0, 0.2] as Types.RGB,
      //   },
      // }

      // renderingEngine.enableElement(viewportInput)

      // const viewport = renderingEngine.getViewport(
      //   viewportId
      // ) as Types.IStackViewport

      // const stack = [imageIds[0]]

      // viewport.setStack(stack)

      // viewport.render()

      // setTimeout(() => {
      //   viewport.render()
      // }, 1000)

      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: elementRef.current,
        defaultOptions: {
          orientation: Enums.OrientationAxis.SAGITTAL,
        },
      }

      renderingEngine.enableElement(viewportInput)

      // Get the stack viewport that was created
      const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport

      // Define a volume in memory
      const volumeId = "streamingImageVolume"
      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      })

      // Set the volume to load
      volume.load()

      // Set the volume on the viewport and it's default properties
      viewport.setVolumes([{ volumeId}])

      // Render the image
      viewport.render()

    }

    setup()

    // Create a stack viewport
  }, [elementRef, running])

  return (
    <div
      ref={elementRef}
      style={{
        width: "512px",
        height: "512px",
        backgroundColor: "#000",
      }}
    ></div>
  )
}

export default App
