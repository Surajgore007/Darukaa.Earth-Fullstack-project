import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { MapView } from '../components/MapView'
import { projectApi } from '../lib/api'
import type { Project, Site } from '../types'

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const load = async () => { try { const { data } = await projectApi.list(); setProjects(data); const siteLists = await Promise.all(data.map((project) => projectApi.sites(project.id))); setSites(siteLists.flatMap((result) => result.data)) } catch { setError('We could not load your landscape data.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const create = async () => { if (!name.trim()) return; await projectApi.create({ name, description }); setName(''); setDescription(''); setShowForm(false); setLoading(true); void load() }
  return <div><section className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Your living portfolio</h1><p className="muted">A field-ready view of every project and site under your care.</p></div><button className="primary-button" onClick={() => setShowForm(true)}>+ New project</button></section>{showForm && <div className="form-card"><h2>Create a project</h2><input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} /><textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} /><div className="form-actions"><button className="quiet-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" onClick={() => void create()}>Create project</button></div></div>}{error && <div className="error-message">{error}</div>}<div className="stat-grid"><div className="stat-card"><span>PROJECTS</span><strong>{projects.length}</strong><small>Active restoration work</small></div><div className="stat-card"><span>SITES</span><strong>{sites.length}</strong><small>Mapped monitoring areas</small></div><div className="stat-card"><span>DATA COVERAGE</span><strong>{sites.length ? '12 mo' : '—'}</strong><small>Historical view per demo site</small></div></div><div className="dashboard-grid"><section className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">GEOSPATIAL VIEW</p><h2>Sites across your portfolio</h2></div><span className="map-legend"><i /> Active sites</span></div>{loading ? <div className="loading-state">Loading map data...</div> : !sites.length ? <div className="empty-state">Create a project and add its first site to see it here.</div> : <MapView sites={sites} onSelect={(site) => window.location.assign(`/sites/${site.id}`)} />}</section><section className="panel project-panel"><div className="panel-heading"><div><p className="eyebrow">WORKSPACES</p><h2>Projects</h2></div></div>{loading ? <div className="loading-state">Loading projects...</div> : projects.length === 0 ? <div className="empty-state">No projects yet.</div> : <div className="project-list">{projects.map((project) => <Link to={`/projects/${project.id}`} className="project-row" key={project.id}><span className="project-dot" /><span><strong>{project.name}</strong><small>{project.project_type || 'Restoration project'}</small></span><b>→</b></Link>)}</div>}</section></div></div>
}
