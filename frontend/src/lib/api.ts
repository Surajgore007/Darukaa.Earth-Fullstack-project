import axios from 'axios'

import type { AnalyticsRecord, Geometry, Project, Site, User } from '../types'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) => api.post<User>('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post<{ access_token: string }>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
}
export const projectApi = {
  list: () => api.get<Project[]>('/projects'),
  create: (data: { name: string; description?: string; project_type?: string }) => api.post<Project>('/projects', data),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  sites: (id: string) => api.get<Site[]>(`/projects/${id}/sites`),
  createSite: (id: string, data: { name: string; description?: string; site_type?: string; area_hectares?: number; geometry: Geometry }) => api.post<Site>(`/projects/${id}/sites`, data),
}
export const siteApi = {
  get: (id: string) => api.get<Site>(`/sites/${id}`),
  analytics: (id: string) => api.get<AnalyticsRecord[]>(`/sites/${id}/analytics`),
}
