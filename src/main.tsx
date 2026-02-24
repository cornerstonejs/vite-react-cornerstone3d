import React from 'react'
import ReactDOM from 'react-dom/client'
import { setConfiguration } from '@cornerstonejs/core';
import { getWasmBasePath } from 'virtual:cornerstone-wasm-config';
import App from './App.tsx'
import Nifti from './Nifti.tsx'
import './index.css'

// Set WASM loading base path (for subpath deployment). Use plugin's value or Vite's base.
const wasmBase = getWasmBasePath() || import.meta.env.BASE_URL
if (wasmBase) {
  // @ts-ignore
  setConfiguration({ wasmBasePath: wasmBase })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* <Nifti /> */}
  </React.StrictMode>,
)
