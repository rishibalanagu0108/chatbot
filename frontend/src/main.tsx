/**
 * Application Entry Point
 *
 * Mounts the React application to the DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { ToastProvider } from '@/context'

// Mount React app to the root element
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
)
