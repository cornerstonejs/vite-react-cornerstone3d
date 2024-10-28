import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader"

export default function initCornerstoneDICOMImageLoader() {
  cornerstoneDICOMImageLoader.init({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
  })
}
