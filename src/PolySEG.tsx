import { useEffect, useRef, useState } from 'react'
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  CONSTANTS,
  utilities,
  eventTarget,
  type Types,
} from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import { init as csRenderInit } from '@cornerstonejs/core'
import { init as csToolsInit } from '@cornerstonejs/tools'
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader'
import createImageIdsAndCacheMetaData from './lib/createImageIdsAndCacheMetaData'

const {
  ToolGroupManager,
  Enums: csToolsEnums,
  segmentation,
  BrushTool,
} = cornerstoneTools

const { MouseBindings } = csToolsEnums
const { ViewportType } = Enums

function PolySEG() {
  const element1Ref = useRef<HTMLDivElement>(null)
  const element2Ref = useRef<HTMLDivElement>(null)
  const element3Ref = useRef<HTMLDivElement>(null)
  const running = useRef(false)
  const [progress, setProgress] = useState(0)
  const [brushActive, setBrushActive] = useState(true)
  const [show3DAnatomy, setShow3DAnatomy] = useState(false)
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(1)

  const handleConvertToSurface = async () => {
    const renderingEngine = window.renderingEngine
    const viewportId3 = 'CT_3D'
    const segmentationId = 'MY_SEGMENTATION_ID'

    await segmentation.addSegmentationRepresentations(viewportId3, [
      {
        segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Surface,
      },
    ])
  }

  const toggleBrushEraser = (toolGroup: any) => {
    if (brushActive) {
      toolGroup.setToolDisabled('EraserBrush', {})
      toolGroup.setToolActive('SphereBrush', {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      })
    } else {
      toolGroup.setToolDisabled('SphereBrush', {})
      toolGroup.setToolActive('EraserBrush', {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      })
    }
  }

  const toggle3DAnatomy = (renderingEngine: RenderingEngine) => {
    const viewport3 = renderingEngine.getViewport('CT_3D')
    const volumeActor = viewport3.getDefaultActor().actor as Types.VolumeActor

    volumeActor.setVisibility(show3DAnatomy)
    viewport3.resetCamera()
    viewport3.render()
  }

  useEffect(() => {
    const setup = async () => {
      if (running.current) return
      running.current = true

      // Initialize cornerstone and tools
      await csRenderInit()
      await csToolsInit()
      await dicomImageLoaderInit()

      // Define constants
      const volumeName = 'CT_VOLUME_ID'
      const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'
      const volumeId = `${volumeLoaderScheme}:${volumeName}`
      const toolGroupId1 = 'TOOLGROUP_MPR'
      const toolGroupId2 = 'TOOLGROUP_3D'
      const renderingEngineId = 'myRenderingEngine'
      const segmentationId = 'MY_SEGMENTATION_ID'

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

      // Setup tool groups
      const toolGroup1 = ToolGroupManager.createToolGroup(toolGroupId1)
      const toolGroup2 = ToolGroupManager.createToolGroup(toolGroupId2)

      // Add tools
      cornerstoneTools.addTool(BrushTool)

      // Configure tools
      toolGroup1.addToolInstance('SphereBrush', BrushTool.toolName, {
        activeStrategy: 'FILL_INSIDE_SPHERE',
      })
      toolGroup1.addToolInstance('EraserBrush', BrushTool.toolName, {
        activeStrategy: 'ERASE_INSIDE_SPHERE',
      })

      toolGroup1.setToolActive('SphereBrush', {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      })

      // Setup rendering engine
      const renderingEngine = new RenderingEngine(renderingEngineId)
      // Store reference for other functions
      window.renderingEngine = renderingEngine

      const viewportInputArray = [
        {
          viewportId: 'CT_AXIAL',
          type: ViewportType.ORTHOGRAPHIC,
          element: element1Ref.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        },
        {
          viewportId: 'CT_SAGITTAL',
          type: ViewportType.ORTHOGRAPHIC,
          element: element2Ref.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
          },
        },
        {
          viewportId: 'CT_3D',
          type: ViewportType.VOLUME_3D,
          element: element3Ref.current,
          defaultOptions: {
            background: CONSTANTS.BACKGROUND_COLORS.slicer3D,
          },
        },
      ]

      renderingEngine.setViewports(viewportInputArray as any)

      // Add viewports to tool groups
      toolGroup1.addViewport('CT_AXIAL', renderingEngineId)
      toolGroup1.addViewport('CT_SAGITTAL', renderingEngineId)
      toolGroup2.addViewport('CT_3D', renderingEngineId)

      // Load volume
      volume.load()

      await setVolumesForViewports(
        renderingEngine,
        [
          {
            volumeId,
            // callback: (actor: Types.VolumeActor) =>
            //   utilities.applyPreset(
            //     actor,
            //     CONSTANTS.VIEWPORT_PRESETS.find(
            //       preset => preset.name === 'CT-Bone'
            //     )
            //   ),
          },
        ],
        ['CT_AXIAL', 'CT_SAGITTAL',]
      )

      // Setup segmentation
      await volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
        volumeId: segmentationId,
      })

      await segmentation.addSegmentations([
        {
          segmentationId,
          representation: {
            type: csToolsEnums.SegmentationRepresentations.Labelmap,
            data: {
              volumeId: segmentationId,
            },
          },
        },
      ])

      const segmentationRepresentation = {
        segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
      }

      await segmentation.addLabelmapRepresentationToViewportMap({
        CT_AXIAL: [segmentationRepresentation],
        CT_SAGITTAL: [segmentationRepresentation],
      })

      // Set up progress tracking
      eventTarget.addEventListener(
        Enums.Events.WEB_WORKER_PROGRESS,
        evt => {
          const { progress } = evt.detail
          setProgress(progress * 100)
        }
      )

      renderingEngine.render()
    }

    setup()
  }, [])

  return (
    <div>
      <div style={{ padding: '10px' }}>
        <button onClick={handleConvertToSurface}>
          Convert labelmap to surface
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          ref={element1Ref}
          style={{
            width: '500px',
            height: '500px',
            backgroundColor: '#000',
          }}
        />
        <div
          ref={element2Ref}
          style={{
            width: '500px',
            height: '500px',
            backgroundColor: '#000',
          }}
        />
        <div
          ref={element3Ref}
          style={{
            width: '500px',
            height: '500px',
            backgroundColor: '#000',
          }}
        />
      </div>
    </div>
  )
}

export default PolySEG

// Add type declaration for window
declare global {
  interface Window {
    renderingEngine: RenderingEngine
  }
}
