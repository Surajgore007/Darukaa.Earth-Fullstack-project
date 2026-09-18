import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

import { MapView } from '../components/MapView'
import { siteApi } from '../lib/api'
import type { AnalyticsRecord, Site } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)
export function SiteDetailPage() {
  const { siteId = '' } = useParams()
  const [site, setSite] = useState<Site | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([])
  const [error, setError] = useState('')
  useEffect(() => { void Promise.all([siteApi.get(siteId), siteApi.analytics(siteId)]).then(([siteResult, analyticsResult]) => { setSite(siteResult.data); setAnalytics(analyticsResult.data) }).catch(() => setError('Unable to load this site.')) }, [siteId])
  if (error) return <div className="error-message">{error}</div>
  if (!site) return <div className="loading-state">Loading site...</div>
  const labels = analytics.map((record) => new Date(record.recorded_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }))
  const chart = (label: string, values: number[], color: string) => ({ labels, datasets: [{ label, data: values, borderColor: color, backgroundColor: `${color}18`, fill: true, tension: 0.35, pointRadius: 3 }] })
  const latest = analytics.length ? analytics[analytics.length - 1] : undefined
  return <div><Link to={`/projects/${site.project_id}`} className="back-link">← Project workspace</Link><section className="page-heading"><div><p className="eyebrow">SITE PROFILE</p><h1>{site.name}</h1><p className="muted">{site.description || site.site_type || 'Environmental monitoring site'}</p></div><span className="synthetic-badge">Synthetic demo data</span></section><div className="site-hero-grid"><section className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">GEOGRAPHY</p><h2>Site boundary</h2></div></div><MapView sites={[site]} /></section><section className="metrics-column"><div className="metric-card"><span>AREA</span><strong>{site.area_hectares ? `${site.area_hectares} ha` : 'Not recorded'}</strong><small>Mapped project area</small></div><div className="metric-card"><span>OBSERVATIONS</span><strong>{analytics.length || '—'}</strong><small>Monthly records available</small></div><div className="metric-card"><span>LAST RECORDED</span><strong>{latest ? new Date(latest.recorded_date).toLocaleDateString() : '—'}</strong><small>Latest synthetic reading</small></div></section></div><section className="analytics-section"><div className="section-heading"><div><p className="eyebrow">PERFORMANCE OVER TIME</p><h2>Environmental indicators</h2></div><span className="muted">Values are synthetic demonstrations</span></div>{analytics.length === 0 ? <div className="empty-state panel">No analytics are available for this site yet.</div> : <div className="chart-grid"><ChartCard title="Carbon stored" unit="tonnes" data={chart('Carbon tonnes', analytics.map((record) => record.carbon_tonnes), '#27724d')} /><ChartCard title="Biodiversity index" unit="index points" data={chart('Biodiversity', analytics.map((record) => record.biodiversity_index), '#b16f3f')} /><ChartCard title="Canopy cover" unit="percent" data={chart('Canopy cover', analytics.map((record) => record.canopy_cover_pct), '#3d6f87')} /></div>}</section></div>
}
function ChartCard({ title, unit, data }: { title: string; unit: string; data: object }) { return <div className="panel chart-card"><div><h3>{title}</h3><span>{unit}</span></div><Line data={data as never} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#e4e8e2' } } } }} /></div> }
