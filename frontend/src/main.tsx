import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { useAuthStore } from './store/authStore'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'

void useAuthStore.getState().restore()
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>)
