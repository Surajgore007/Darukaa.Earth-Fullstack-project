import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { useAuthStore } from './store/authStore'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { SiteDetailPage } from './pages/SiteDetailPage'

function Protected() { const user = useAuthStore((state) => state.user); const hydrated = useAuthStore((state) => state.hydrated); if (!hydrated) return <div className="loading-state">Restoring session...</div>; return user ? <Layout /> : <Navigate to="/login" replace /> }
export function App() { return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<Protected />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/projects/:projectId" element={<ProjectDetailPage />} /><Route path="/sites/:siteId" element={<SiteDetailPage />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes> }
