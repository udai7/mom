import type { ComponentType } from 'react'
import type { Role } from './mockData'

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
  description: string
}

export const profiles: Profile[] = [
  {
    level: 'Office Admin',
    title: 'Office Admin',
    office: 'NIC Tripura',
    description: 'Create meetings, manage guests, submit summaries, and schedule follow-ups.',
  },
  {
    level: 'Parent Office',
    title: 'Parent Office',
    office: 'DM Office',
    description: 'View read-only summaries and activity flowing up from child offices.',
  },
  {
    level: 'Super Admin',
    title: 'Super Admin',
    office: 'District IT / NIC',
    description: 'Manage users, offices, hierarchy, and audit-facing administration screens.',
  },
  {
    level: 'Office Member',
    title: 'Office Member',
    office: 'DIT Tripura',
    description: 'Track invited meetings, view summaries, and follow assigned action items.',
  },
]

export const ROLE_PREFIXES: Record<DashboardLevel, string> = {
  'Office Admin': 'office-admin',
  'Parent Office': 'dm',
  'Super Admin': 'super',
  'Office Member': 'member',
}

export const PREFIX_TO_ROLE: Record<string, DashboardLevel> = {
  'office-admin': 'Office Admin',
  'dm': 'Parent Office',
  'super': 'Super Admin',
  'member': 'Office Member',
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
