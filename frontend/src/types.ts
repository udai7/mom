import type { ComponentType } from 'react'
import type { Role, Meeting } from './mockData'
import { initialMeetings } from './mockData'

export type DashboardLevel = Role | 'Parent Office'

export type WorkspaceView =
  | 'Overview'
  | 'Meetings'
  | 'Create Meeting'
  | 'Meeting Detail'
  | 'Submit Summary'
  | 'Hierarchy'
  | 'Offices'
  | 'Users'

export type Icon = ComponentType<{ className?: string }>

export interface Profile {
  level: DashboardLevel
  title: string
  office: string
  officeCode: string // associated office code for visual testing
  description: string
}

export const profiles: Profile[] = [
  {
    level: 'Office Admin',
    title: 'Office Admin',
    office: 'NIC Tripura',
    officeCode: 'NIC-TRP-01',
    description: 'Create meetings, manage guests, submit summaries, and schedule follow-ups.',
  },
  {
    level: 'Parent Office',
    title: 'Parent Office',
    office: 'DM Office',
    officeCode: 'DM-TRP',
    description: 'View read-only summaries and activity flowing up from child offices.',
  },
  {
    level: 'Super Admin',
    title: 'Super Admin',
    office: 'District IT / NIC',
    officeCode: 'DM-TRP',
    description: 'Manage users, offices, hierarchy, and audit-facing administration screens.',
  },
]

export const ROLE_PREFIXES: Record<DashboardLevel, string> = {
  'Office Admin': 'office-admin',
  'Parent Office': 'dm',
  'Super Admin': 'super',
}

export const PREFIX_TO_ROLE: Record<string, DashboardLevel> = {
  'office-admin': 'Office Admin',
  'dm': 'Parent Office',
  'super': 'Super Admin',
}

export const VIEW_SLUGS: Record<WorkspaceView, string> = {
  'Overview': 'overview',
  'Meetings': 'meetings',
  'Create Meeting': 'create-meeting',
  'Meeting Detail': 'meeting-detail',
  'Submit Summary': 'submit-summary',
  'Hierarchy': 'hierarchy',
  'Offices': 'offices',
  'Users': 'users',
}

export const SLUG_TO_VIEW: Record<string, WorkspaceView> = {
  'overview': 'Overview',
  'meetings': 'Meetings',
  'create-meeting': 'Create Meeting',
  'meeting-detail': 'Meeting Detail',
  'submit-summary': 'Submit Summary',
  'hierarchy': 'Hierarchy',
  'offices': 'Offices',
  'users': 'Users',
}

export function getStoredMeetings(): Meeting[] {
  const data = localStorage.getItem('mom_meetings')
  if (!data) {
    localStorage.setItem('mom_meetings', JSON.stringify(initialMeetings))
    return initialMeetings
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    return initialMeetings
  }
}

export function saveStoredMeetings(meetings: Meeting[]) {
  localStorage.setItem('mom_meetings', JSON.stringify(meetings))
}

