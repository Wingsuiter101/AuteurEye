import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle SPA routing
const path = localStorage.getItem('spa-path');
if (path) {
  localStorage.removeItem('spa-path');
  window.history.replaceState(null, '', '/AuteurEye/' + path);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)