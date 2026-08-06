import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installCodiicPlatformFingerprints } from './platform/codiic-platform-fingerprint'

installCodiicPlatformFingerprints()

createRoot(document.getElementById('root')!).render(<App />)
