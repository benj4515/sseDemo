import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {StreamProvider} from "./hooks/useStream.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <StreamProvider config={{
          connectEvent: "connected",
          urlForStreamEndpoint: "http://localhost:5196/stream",
      }}>

          <App />

      </StreamProvider>
  </StrictMode>,
)
