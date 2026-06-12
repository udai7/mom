const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('mom_access_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

export interface RegisterDMParams {
  name: string
  official_email: string
  official_phone: string
  address_line_1: string
  address_line_2?: string
  city?: string
  district: string
  state: string
  pincode?: string
  website?: string
  admin_name: string
  admin_designation: string
  admin_email: string
  admin_mobile: string
  admin_password: string
  employee_id?: string
}

export interface RegisterOfficeParams {
  parent_id: string
  name: string
  office_slug?: string
  type?: string
  department?: string
  official_email: string
  official_phone: string
  address_line_1: string
  address_line_2?: string
  city?: string
  district: string
  state: string
  pincode?: string
  website?: string
  admin_name: string
  admin_designation: string
  admin_email: string
  admin_mobile: string
  admin_password: string
  employee_id?: string
}

export interface RegistrationRequest {
  id: string
  office_id: string
  primary_user_id: string
  parent_office_id: string | null
  requested_role: string
  status: string
  submitted_payload: any
  submitted_at: string
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  review_note: string | null
  office: {
    id: string
    parent_id: string | null
    dm_root_id: string | null
    name: string
    code: string
    type: string
    approval_status: string
    is_active: boolean
  }
  primary_user: {
    id: string
    full_name: string
    designation: string
    email: string
    role: string
    status: string
  }
}

export interface BackendOffice {
  id: string
  parent_id: string | null
  dm_root_id: string | null
  name: string
  code: string
  type: string
  approval_status: string
  is_active: boolean
}

export interface BackendUser {
  id: string
  full_name: string
  designation: string
  email: string
  mobile_number: string
  role: string
  status: string
  office: {
    id: string | null
    name: string | null
    code: string | null
    type: string | null
  }
  permissions: string[]
  must_change_password: boolean
}

export async function registerDM(params: RegisterDMParams): Promise<BackendOffice> {
  const response = await fetch(`${API_BASE_URL}/registrations/dm`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to register DM Office.')
  }
  return response.json()
}

export async function registerOffice(params: RegisterOfficeParams): Promise<RegistrationRequest> {
  const response = await fetch(`${API_BASE_URL}/registrations/offices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // public sign up
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to submit registration.')
  }
  return response.json()
}

export async function getPendingRegistrations(): Promise<RegistrationRequest[]> {
  const response = await fetch(`${API_BASE_URL}/registrations/pending`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load pending registrations.')
  }
  return response.json()
}

export async function approveRegistration(id: string, reviewNote?: string): Promise<RegistrationRequest> {
  const response = await fetch(`${API_BASE_URL}/registrations/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ review_note: reviewNote }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to approve registration.')
  }
  return response.json()
}

export async function rejectRegistration(id: string, rejectionReason: string): Promise<RegistrationRequest> {
  const response = await fetch(`${API_BASE_URL}/registrations/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejection_reason: rejectionReason }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to reject registration.')
  }
  return response.json()
}

export async function getAccounts(): Promise<BackendUser[]> {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load accounts.')
  }
  return response.json()
}

export async function blockAccount(id: string): Promise<BackendUser> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}/block`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to block account.')
  }
  return response.json()
}

export async function deactivateAccount(id: string): Promise<BackendUser> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}/deactivate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to deactivate account.')
  }
  return response.json()
}

export async function reactivateAccount(id: string): Promise<BackendUser> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}/reactivate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to reactivate account.')
  }
  return response.json()
}

export async function resetPassword(id: string, newPassword: string): Promise<BackendUser> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_password: newPassword }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to reset password.')
  }
  return response.json()
}

export async function getAllOffices(): Promise<BackendOffice[]> {
  const response = await fetch(`${API_BASE_URL}/registrations/offices/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load offices.')
  }
  return response.json()
}

export async function getPublicParentOffices(): Promise<BackendOffice[]> {
  const response = await fetch(`${API_BASE_URL}/registrations/public/parent-offices`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load parent offices.')
  }
  return response.json()
}

