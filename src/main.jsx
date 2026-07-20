import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

// Purge Base44 auth tokens before App/SDK modules load.
// Static imports are hoisted, so boot via dynamic import after the purge.
try {
  localStorage.removeItem('base44_access_token')
  localStorage.removeItem('token')
} catch {
  /* ignore */
}

import('@/App.jsx').then(({ default: App }) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
})
