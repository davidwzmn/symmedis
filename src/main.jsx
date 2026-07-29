import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { InboxProvider } from './components/InboxProvider.jsx'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <InboxProvider>
        <App />
      </InboxProvider>
    </ToastProvider>
  </StrictMode>,
)
