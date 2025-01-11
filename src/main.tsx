import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle redirect from 404 page
const redirectHandler = () => {
  // Get the redirect path from the URL
  const pathname = window.location.search.match(/^\?(.+)$/)?.[1];
  if (pathname) {
    // Replace the URL with the actual path
    window.history.replaceState(null, '', '/AuteurEye/' + pathname);
  }
};

redirectHandler();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)