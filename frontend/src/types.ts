export type Geometry = { type: 'Polygon'; coordinates: number[][][] }

export type User = { id: string; email: string; full_name: string; created_at: string }
export type Project = { id: string; name: string; description?: string; project_type?: string; owner_id: string; created_at: string; updated_at: string }
export type Site = { id: string; project_id: string; name: string; description?: string; site_type?: string; area_hectares?: number; geometry: Geometry; created_at: string }
export type AnalyticsRecord = { id: string; site_id: string; recorded_date: string; carbon_tonnes: number; biodiversity_index: number; canopy_cover_pct: number; created_at: string }
