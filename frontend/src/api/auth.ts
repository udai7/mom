export type BackendRole = 'SUPER_ADMIN' | 'DM_ADMIN' | 'OFFICE_ADMIN' | 'OFFICE_MEMBER'

export interface AuthUser {
  id: string
  full_name: string
  designation: string
  email: string
  mobile_number: string
  role: BackendRole
  status: string
  office: {
    id: string | null
    name: string | null
    code: string | null
    type: string | null
    dm_root_id: string | null
  }
  permissions: string[]
  must_change_password: boolean
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.detail ?? 'Unable to sign in.')
  }

  return response.json()
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export function saveAuthSession(auth: LoginResponse) {
  localStorage.setItem('mom_access_token', auth.access_token)
  localStorage.setItem('mom_refresh_token', auth.refresh_token)
  localStorage.setItem('mom_user', JSON.stringify(auth.user))
}

export function clearAuthSession() {
  localStorage.removeItem('mom_access_token')
  localStorage.removeItem('mom_refresh_token')
  localStorage.removeItem('mom_user')
  localStorage.removeItem('mom_authenticated')
  localStorage.removeItem('mom_role')
}

