import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Fonts and icons are bundled and served from this site, not from Google Fonts
// or a CDN, so no third-party stylesheet can restyle the page.
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@fontsource/space-mono/400-italic.css'
import '@fontsource/space-mono/700-italic.css'
import '@fontsource/anton-sc/400.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
