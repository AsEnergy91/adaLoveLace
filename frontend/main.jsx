import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProjetActifProvider } from './context/ProjetActifContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProjetActifProvider>
        <App />
      </ProjetActifProvider>
    </BrowserRouter>
  </StrictMode>
)