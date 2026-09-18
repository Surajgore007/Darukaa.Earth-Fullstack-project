import { create } from 'zustand'

import { authApi } from '../lib/api'
import type { User } from '../types'

type AuthState = { user: User | null; loading: boolean; hydrated: boolean; error: string | null; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, fullName: string) => Promise<void>; restore: () => Promise<void>; logout: () => void }

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('darukaa_token', data.access_token)
      const user = await authApi.me()
      set({ user: user.data, loading: false })
    } catch (error) {
      set({ loading: false, error: 'Unable to sign in. Check your credentials.' })
      throw error
    }
  },
  register: async (email, password, fullName) => {
    set({ loading: true, error: null })
    try {
      await authApi.register({ email, password, full_name: fullName })
      await authApi.login({ email, password }).then(({ data }) => localStorage.setItem('darukaa_token', data.access_token))
      const user = await authApi.me()
      set({ user: user.data, loading: false })
    } catch (error) {
      set({ loading: false, error: 'Unable to create the account.' })
      throw error
    }
  },
  restore: async () => {
    if (!localStorage.getItem('darukaa_token')) return set({ hydrated: true })
    try { const { data } = await authApi.me(); set({ user: data, hydrated: true }) } catch { localStorage.removeItem('darukaa_token'); set({ hydrated: true }) }
  },
  logout: () => {
    localStorage.removeItem('darukaa_token')
    set({ user: null })
  },
}))
