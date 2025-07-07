import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Mantenha este import por enquanto, mas ele será um arquivo vazio.
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)