import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clean vanilla interceptor for B2B routing so we don't break the main app
const path = window.location.pathname;
if (path.startsWith('/safe/')) {
  const org_id = path.split('/safe/')[1];
  if (org_id) {
    sessionStorage.setItem('unkahi_org_id', org_id);
    // Strip the ID from the URL securely
    window.history.replaceState(null, '', '/');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
