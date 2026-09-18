import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, Polygon } from 'geojson'

import type { Site, Geometry } from '../types'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

type Props = { sites: Site[]; onSelect?: (site: Site) => void; drawing?: boolean; onDraw?: (geometry: Geometry) => void }

export function MapView({ sites, onSelect, drawing = false, onDraw }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const draw = useRef<MapboxDraw | null>(null)
  useEffect(() => {
    if (!container.current || map.current || !mapboxgl.accessToken) return
    map.current = new mapboxgl.Map({ container: container.current, style: 'mapbox://styles/mapbox/outdoors-v12', center: [74.87, 13.27], zoom: 8 })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.on('load', () => {
      map.current?.addSource('sites', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.current?.addLayer({ id: 'site-fill', type: 'fill', source: 'sites', paint: { 'fill-color': '#2c7a52', 'fill-opacity': 0.28 } })
      map.current?.addLayer({ id: 'site-line', type: 'line', source: 'sites', paint: { 'line-color': '#17613f', 'line-width': 2 } })
      map.current?.on('click', 'site-fill', (event) => {
        const id = event.features?.[0]?.properties?.id
        const selected = sites.find((site) => site.id === id)
        if (selected) onSelect?.(selected)
      })
    })
    return () => { map.current?.remove(); map.current = null }
  }, [onSelect, sites])
  useEffect(() => {
    const source = map.current?.getSource('sites') as mapboxgl.GeoJSONSource | undefined
    if (!source) return
    source.setData({ type: 'FeatureCollection', features: sites.map((site) => ({ type: 'Feature', properties: { id: site.id }, geometry: site.geometry })) })
  }, [sites])
  useEffect(() => {
    if (!map.current || !drawing || draw.current) return
    draw.current = new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true } })
    map.current.addControl(draw.current, 'top-left')
    const handleCreate = (event: { features: Feature<Polygon>[] }) => {
      const geometry = event.features[0]?.geometry
      if (geometry?.type === 'Polygon') onDraw?.(geometry as Geometry)
    }
    map.current.on('draw.create', handleCreate)
    return () => { if (draw.current) map.current?.removeControl(draw.current); draw.current = null; map.current?.off('draw.create', handleCreate) }
  }, [drawing, onDraw])
  return <div ref={container} className="map-frame" />
}
