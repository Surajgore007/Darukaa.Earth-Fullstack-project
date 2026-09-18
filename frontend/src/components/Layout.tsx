import { Link, Outlet, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

export function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  return <div className="app-shell"><header className="topbar"><Link to="/dashboard" className="brand"><span className="brand-mark">D</span><span>Darukaa<span className="brand-muted">.Earth</span></span></Link><div className="user-nav"><span>{user?.full_name}</span><button onClick={() => { logout(); navigate('/login') }}>Log out</button></div></header><main className="page-content"><Outlet /></main></div>
}
