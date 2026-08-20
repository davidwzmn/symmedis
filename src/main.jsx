import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { installOperationalTelemetry } from './lib/operationalTelemetry.js'
import './index.css'

installOperationalTelemetry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
