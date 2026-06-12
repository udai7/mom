const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('mom_access_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

export interface BackendMeetingGuest {
  id: string
  meeting_id: string
  name: string
  phone: string
  email: string
  office: string
  department: string
  designation: string
  created_at: string
}

export interface BackendMeeting {
  id: string
  office_id: string
  title: string
  agenda: string
  time: string
  date: string
  venue: string
  institution_name: string
  department_name: string
  meeting_type: string
  chairperson: string | null
  status: 'upcoming' | 'ongoing' | 'completed'
  created_at: string
  updated_at: string
  office_name: string | null
  guests: BackendMeetingGuest[]
}

export interface MeetingCreateParams {
  title: string
  agenda: string
  time: string
  date: string
  venue: string
  institution_name: string
  department_name: string
  meeting_type: string
  chairperson?: string | null
}

export interface MeetingUpdateParams {
  title?: string
  agenda?: string
  time?: string
  date?: string
  venue?: string
  institution_name?: string
  department_name?: string
  meeting_type?: string
  chairperson?: string | null
  status?: 'upcoming' | 'ongoing' | 'completed'
}

export interface GuestCreateParams {
  name: string
  phone: string
  email: string
  office: string
  department: string
  designation: string
}

export async function getMeetings(): Promise<BackendMeeting[]> {
  const response = await fetch(`${API_BASE_URL}/meetings/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load meetings.')
  }
  return response.json()
}

export async function getMeeting(id: string): Promise<BackendMeeting> {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to load meeting details.')
  }
  return response.json()
}

export async function createMeeting(params: MeetingCreateParams): Promise<BackendMeeting> {
  const response = await fetch(`${API_BASE_URL}/meetings/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to create meeting.')
  }
  return response.json()
}

export async function updateMeeting(id: string, params: MeetingUpdateParams): Promise<BackendMeeting> {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to update meeting.')
  }
  return response.json()
}

export async function postponeMeeting(id: string, date: string, time: string): Promise<BackendMeeting> {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}/postpone`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, time }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to postpone meeting.')
  }
  return response.json()
}

export async function deleteMeeting(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to delete meeting.')
  }
}

export async function addMeetingGuest(meetingId: string, params: GuestCreateParams): Promise<BackendMeetingGuest> {
  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/guests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to add guest.')
  }
  return response.json()
}

export async function removeMeetingGuest(meetingId: string, guestId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/guests/${guestId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.detail ?? 'Failed to remove guest.')
  }
}
