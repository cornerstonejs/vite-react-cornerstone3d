import { useEffect, useRef } from "react"
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  type Types,
} from "@cornerstonejs/core"
import * as cornerstoneTools from "@cornerstonejs/tools"
import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData"
import { init as csRenderInit } from "@cornerstonejs/core"
import { init as csToolsInit } from "@cornerstonejs/tools"
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader"

const {
  ToolGroupManager,
  Enums: csToolsEnums,
  segmentation,
  BrushTool,
  StackScrollTool
} = cornerstoneTools

const { MouseBindings } = csToolsEnums
const { ViewportType } = Enums

function Interpolation() {
  const element1Ref = useRef<HTMLDivElement>(null)
  const element2Ref = useRef<HTMLDivElement>(null)
  const element3Ref = useRef<HTMLDivElement>(null)
  const running = useRef(false)
  const segmentationId = useRef("MY_SEGMENTATION_ID")

  const handleInterpolation = async () => {
    const activeSegmentIndex = segmentation.segmentIndex.getActiveSegmentIndex(
      segmentationId.current
    )
    
    const { utilities: { segmentation: segmentationUtils } } = cornerstoneTools

    // segmentationUtils.interpolateLabelmap({
    //   segmentationId: segmentationId.current,
    //   segmentIndex: activeSegmentIndex,
    // })
  }

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return
      }
      running.current = true

      await csRenderInit()
      await csToolsInit({ peerImport: (moduleId) => {
        if(moduleId === "@itk-wasm/morphological-contour-interpolation"){
          return import("@itk-wasm/morphological-contour-interpolation")
        } else if(moduleId === "itk-wasm"){
          return import("itk-wasm")
        }
      } })
      dicomImageLoaderInit({maxWebWorkers:1})

      // Define constants
      const volumeName = "CT_VOLUME_ID"
      const volumeLoaderScheme = "cornerstoneStreamingImageVolume"
      const volumeId = `${volumeLoaderScheme}:${volumeName}`
      const toolGroupId = "MY_TOOLGROUP_ID"
      const renderingEngineId = "myRenderingEngine"

      // Create and cache volume
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        wadoRsRoot: "https://d14fa38qiwhyfd.cloudfront.net/dicomweb",
      })


      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      })

      // Create segmentation
      await volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
        volumeId: segmentationId.current,
      })

      // Add segmentation to state
      segmentation.addSegmentations([
        {
          segmentationId: segmentationId.current,
          representation: {
            type: csToolsEnums.SegmentationRepresentations.Labelmap,
            data: {
              volumeId: segmentationId.current,
            },
          },
        },
      ])

      // Setup tools
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)

      // Add tools
      cornerstoneTools.addTool(BrushTool)
      cornerstoneTools.addTool(StackScrollTool)


      // Add tools to toolgroup
      toolGroup.addTool(BrushTool.toolName)
      toolGroup.addTool(StackScrollTool.toolName)
      // Set active tool
      toolGroup.setToolActive(BrushTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      })
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Wheel }],
      })

      // Setup rendering engine
      const renderingEngine = new RenderingEngine(renderingEngineId)

      const viewportId1 = "CT_AXIAL"
      const viewportId2 = "CT_SAGITTAL"
      const viewportId3 = "CT_CORONAL"

      const viewportInputArray = [
        {
          viewportId: viewportId1,
          type: ViewportType.ORTHOGRAPHIC,
          element: element1Ref.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
            background: [0, 0, 0] as Types.Point3,
          },
        },
        {
          viewportId: viewportId2,
          type: ViewportType.ORTHOGRAPHIC,
          element: element2Ref.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
            background: [0, 0, 0] as Types.Point3,
          },
        },
        {
          viewportId: viewportId3,
          type: ViewportType.ORTHOGRAPHIC,
          element: element3Ref.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.CORONAL,
            background: [0, 0, 0] as Types.Point3,
          },
        },
      ]

      renderingEngine.setViewports(viewportInputArray)

      toolGroup.addViewport(viewportId1, renderingEngineId)
      toolGroup.addViewport(viewportId2, renderingEngineId)
      toolGroup.addViewport(viewportId3, renderingEngineId)

      volume.load()

      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId }],
        [viewportId1, viewportId2, viewportId3]
      )

      const segMap = {
        [viewportId1]: [{ segmentationId: segmentationId.current }],
        [viewportId2]: [{ segmentationId: segmentationId.current }],
        [viewportId3]: [{ segmentationId: segmentationId.current }],
      }
      await segmentation.addLabelmapRepresentationToViewportMap(segMap)

      renderingEngine.render()

      // Move segmentationId to ref for access in handleInterpolation
      segmentationId.current = "MY_SEGMENTATION_ID"
    }

    setup()
  }, [])

  return (
    <div>
      <button
        onClick={handleInterpolation}
      >
        Run Interpolation
      </button>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          ref={element1Ref}
          style={{
            width: "500px",
            height: "500px",
            backgroundColor: "#000",
          }}
        />
        <div
          ref={element2Ref}
          style={{
            width: "500px",
            height: "500px",
            backgroundColor: "#000",
          }}
        />
        <div
          ref={element3Ref}
          style={{
            width: "500px",
            height: "500px",
            backgroundColor: "#000",
          }}
        />
      </div>
    </div>
  )
}

export default Interpolation
