import React from 'react'
import ReactDOM from 'react-dom/client'
import AgenzieCase from './AgenzieCase.jsx'

// Sentry Error Tracking (production only)
if (import.meta.env.PROD) {
  // Imposta SENTRY_DSN come variabile globale prima di importare
  // In produzione, questo viene iniettato durante il build
  window.SENTRY_DSN = window.SENTRY_DSN || 'your-sentry-dsn-here';
  import('./sentry.client.cjs');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AgenzieCase />
  </React.StrictMode>,
)
