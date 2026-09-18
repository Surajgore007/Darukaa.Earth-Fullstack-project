import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { MapView } from '../components/MapView'
import { projectApi } from '../lib/api'
import type { Geometry, Project, Site } from '../types'

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const [showDraw, setShowDraw] = useState(false)
  const [name, setName] = useState('')
  const [siteType, setSiteType] = useState('')
  const [message, setMessage] = useState('')
  const load = useCallback(async () => { const [projectResult, siteResult] = await Promise.all([projectApi.get(projectId), projectApi.sites(projectId)]); setProject(projectResult.data); setSites(siteResult.data) }, [projectId])
  useEffect(() => { void load() }, [load])
  const saveSite = async () => { if (!geometry || !name.trim()) return; await projectApi.createSite(projectId, { name, site_type: siteType, geometry }); setName(''); setSiteType(''); setGeometry(null); setShowDraw(false); setMessage('Site added to the project.'); await load() }
  if (!project) return <div className="loading-state">Loading project...</div>
  return <div><Link to="/dashboard" className="back-link">← Portfolio</Link><section className="page-heading"><div><p className="eyebrow">PROJECT / {project.project_type || 'RESTORATION'}</p><h1>{project.name}</h1><p className="muted">{project.description || 'A focused workspace for tracking ecological change.'}</p></div><button className="primary-button" onClick={() => setShowDraw((value) => !value)}>{showDraw ? 'Close drawing' : '+ Draw new site'}</button></section>{message && <div className="success-message">{message}</div>}<div className="project-layout"><section className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">PROJECT MAP</p><h2>{sites.length} mapped site{sites.length === 1 ? '' : 's'}</h2></div></div><MapView sites={sites} drawing={showDraw} onDraw={(value) => setGeometry(value)} onSelect={(site) => window.location.assign(`/sites/${site.id}`)} /></section><section className="panel site-panel"><div className="panel-heading"><div><p className="eyebrow">MONITORING AREAS</p><h2>Sites</h2></div></div>{showDraw && <div className="draw-form"><p>{geometry ? 'Polygon captured. Add the site details.' : 'Use the polygon tool on the map to outline a site.'}</p><input placeholder="Site name" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Site type" value={siteType} onChange={(e) => setSiteType(e.target.value)} /><button className="primary-button" disabled={!geometry || !name} onClick={() => void saveSite()}>Save site</button></div>}{sites.length === 0 ? <div className="empty-state">No sites mapped yet.</div> : <div className="site-list">{sites.map((site) => <Link to={`/sites/${site.id}`} className="site-row" key={site.id}><span><strong>{site.name}</strong><small>{site.site_type || 'Monitoring site'}{site.area_hectares ? ` · ${site.area_hectares} ha` : ''}</small></span><b>→</b></Link>)}</div>}</section></div></div>
}
