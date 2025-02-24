import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Nifti from './Nifti.tsx'
// import Interpolation from './Interpolation.tsx'
import PolySEG from './PolySEG.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    {/* <Nifti /> */}
    {/* <Interpolation /> */}
    <PolySEG />
  </React.StrictMode>,
)
