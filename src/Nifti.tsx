import { useEffect, useRef } from "react"
import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData"
import {
  RenderingEngine,
  Enums,
  type Types,
  volumeLoader,
  imageLoader,
} from "@cornerstonejs/core"
import { init as csRenderInit } from "@cornerstonejs/core"
import {
  cornerstoneNiftiImageLoader,
  createNiftiImageIdsAndCacheMetadata,
} from "@cornerstonejs/nifti-volume-loader"
import { ImageLoaderFn } from "@cornerstonejs/core/types"

function Nifti() {
  const elementRef = useRef<HTMLDivElement>(null)
  const running = useRef(false)

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return
      }
      running.current = true

      await csRenderInit()

      const viewportId1 = "CT_NIFTI_AXIAL"

      const niftiURL =
        "https://ohif-assets.s3.us-east-2.amazonaws.com/nifti/CTACardio.nii.gz"

      imageLoader.registerImageLoader(
        "nifti",
        cornerstoneNiftiImageLoader as unknown as ImageLoaderFn
      )

      const imageIds = await createNiftiImageIdsAndCacheMetadata({
        url: niftiURL,
      })

      const renderingEngineId = "myRenderingEngine"
      const renderingEngine = new RenderingEngine(renderingEngineId)

      const viewportInputArray = [
        {
          viewportId: viewportId1,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
        },
      ]

      renderingEngine.setViewports(viewportInputArray)

      const vps = renderingEngine.getStackViewports()
      const viewport = vps[0]

      viewport.setStack(imageIds)

      renderingEngine.render()
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

export default Nifti
