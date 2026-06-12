export type Role = 'Office Admin' | 'Super Admin'

export type View =
  | 'Dashboard'
  | 'Meetings'
  | 'Create Meeting'
  | 'Meeting Detail'
  | 'Submit Summary'
  | 'Office Management'
  | 'User Management'

export type MeetingStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type OfficeNode = {
  name: string
  code: string
  type: string
  meetings: number
  pending: number
  lastMeeting: string
  children?: OfficeNode[]
}

export type Meeting = {
  id: string
  title: string
  officeName: string
  officeCode: string
  status: MeetingStatus
  date: string
  location: string
  guests: number
  summary: string
  actionItems: number
  parentMeetingId?: string // to keep track of follow-up thread
  agenda?: string
  pdfFileName?: string
}

export const offices: OfficeNode[] = [
  {
    name: 'DM Office',
    code: 'DM-TRP',
    type: 'DM',
    meetings: 34,
    pending: 3,
    lastMeeting: '11 Jun 2026',
    children: [
      {
        name: 'ADM Office',
        code: 'ADM-01',
        type: 'ADM',
        meetings: 18,
        pending: 2,
        lastMeeting: '10 Jun 2026',
        children: [
          {
            name: 'Sub-Divisional Office A',
            code: 'SDO-A',
            type: 'OTHER',
            meetings: 7,
            pending: 1,
            lastMeeting: '08 Jun 2026',
          },
          {
            name: 'Sub-Divisional Office B',
            code: 'SDO-B',
            type: 'OTHER',
            meetings: 4,
            pending: 0,
            lastMeeting: '03 Jun 2026',
          },
        ],
      },
      {
        name: 'NIC Tripura',
        code: 'NIC-TRP-01',
        type: 'NIC',
        meetings: 22,
        pending: 4,
        lastMeeting: '11 Jun 2026',
        children: [
          {
            name: 'NIC Sub-office 1',
            code: 'NIC-S1',
            type: 'NIC',
            meetings: 8,
            pending: 1,
            lastMeeting: '09 Jun 2026',
          },
          {
            name: 'NIC Sub-office 2',
            code: 'NIC-S2',
            type: 'NIC',
            meetings: 6,
            pending: 2,
            lastMeeting: '06 Jun 2026',
          },
        ],
      },
      {
        name: 'DIT Tripura',
        code: 'DIT-TRP',
        type: 'DIT',
        meetings: 15,
        pending: 1,
        lastMeeting: '07 Jun 2026',
      },
      {
        name: 'SCERT',
        code: 'SCERT-01',
        type: 'SCERT',
        meetings: 9,
        pending: 0,
        lastMeeting: '04 Jun 2026',
        children: [
          {
            name: 'SCERT Sub-office A',
            code: 'SCERT-S1',
            type: 'SCERT',
            meetings: 3,
            pending: 0,
            lastMeeting: '01 Jun 2026',
          }
        ]
      },
      {
        name: 'TRML',
        code: 'TRML-01',
        type: 'TRML',
        meetings: 11,
        pending: 1,
        lastMeeting: '10 Jun 2026',
        children: [
          {
            name: 'TRML Sub-office A',
            code: 'TRML-S1',
            type: 'TRML',
            meetings: 5,
            pending: 1,
            lastMeeting: '09 Jun 2026',
          }
        ]
      },
    ],
  },
]

// Default pre-populated meetings
export const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'District e-Governance Review',
    officeName: 'DM Office',
    officeCode: 'DM-TRP',
    status: 'SCHEDULED',
    date: '2026-06-12T11:00',
    location: 'DM Conference Hall',
    guests: 18,
    summary: 'Pending',
    actionItems: 6,
    agenda: 'Review of district-level e-Governance initiatives, pending connectivity actions, PDF record submission, and follow-up ownership across NIC, DIT, ADM, and block offices.',
  },
  {
    id: 'meet-2',
    title: 'NIC Infrastructure Upgrade',
    officeName: 'NIC Tripura',
    officeCode: 'NIC-TRP-01',
    status: 'COMPLETED',
    date: '2026-06-10T15:30',
    location: 'NIC Meeting Room',
    guests: 9,
    summary: 'Submitted v2',
    actionItems: 4,
    agenda: 'Review network backbone speed and server rack layouts in all District IT centers.',
  },
  {
    id: 'meet-3',
    title: 'Block Office Connectivity Follow-up',
    officeName: 'DIT Tripura',
    officeCode: 'DIT-TRP',
    status: 'IN_PROGRESS',
    date: '2026-06-11T14:00',
    location: 'Virtual',
    guests: 23,
    summary: 'Not due',
    actionItems: 8,
    agenda: 'Following up on regional connectivity gaps and optical fiber alignments.',
  },
  {
    id: 'meet-4',
    title: 'SCERT Curriculum Digitization',
    officeName: 'SCERT',
    officeCode: 'SCERT-01',
    status: 'COMPLETED',
    date: '2026-06-06T12:00',
    location: 'SCERT Board Room',
    guests: 12,
    summary: 'PDF only',
    actionItems: 3,
    agenda: 'Reviewing digital textbooks upload process on DIKSHA platform.',
  },
  {
    id: 'meet-5',
    title: 'TRML Land Records Digitization',
    officeName: 'TRML',
    officeCode: 'TRML-01',
    status: 'SCHEDULED',
    date: '2026-06-15T10:30',
    location: 'TRML Hall 2',
    guests: 14,
    summary: 'Pending',
    actionItems: 5,
    agenda: 'Planning phase for cadastral map digitalization in block levels.',
  },
  {
    id: 'meet-6',
    title: 'TRML Sub-office Connectivity Setup',
    officeName: 'TRML Sub-office A',
    officeCode: 'TRML-S1',
    status: 'COMPLETED',
    date: '2026-06-09T11:00',
    location: 'Sub-office Conference Space',
    guests: 6,
    summary: 'Initial report completed',
    actionItems: 2,
    agenda: 'Assessing hardware requirements for networking TRML sub-offices.',
  },
]

// To maintain standard compatibility for files that do not support dynamic state yet
export const meetings = initialMeetings.map(m => ({
  title: m.title,
  office: m.officeName,
  status: m.status,
  date: m.date.replace('T', ' '),
  location: m.location,
  guests: m.guests,
  summary: m.summary,
  actionItems: m.actionItems
}))

export const guests = [
  ['Maya Debbarma', 'District Informatics Officer', 'NIC Tripura', 'ATTENDED'],
  ['R. Chakraborty', 'Additional District Magistrate', 'ADM Office', 'CONFIRMED'],
  ['Ananya Saha', 'Project Lead', 'DIT Tripura', 'INVITED'],
  ['External: CM Secretariat', 'Special Officer', 'Chief Minister Office', 'INVITED'],
]

export const actions = [
  ['Finalize connectivity audit for block offices', 'DIT Tripura', '18 Jun 2026', 'OPEN'],
  ['Upload signed MoM PDF to district record', 'NIC Tripura', '12 Jun 2026', 'IN_PROGRESS'],
  ['Prepare follow-up agenda for ADM review', 'ADM Office', '20 Jun 2026', 'DONE'],
]

export const users = [
  ['Udai Das', 'udai.das@gov.in', 'DM Office', 'SUPER_ADMIN', 'Active'],
  ['Maya Debbarma', 'maya.nic@gov.in', 'NIC Tripura', 'OFFICE_ADMIN', 'Active'],
  ['Ananya Saha', 'ananya.dit@gov.in', 'DIT Tripura', 'OFFICE_ADMIN', 'Active'],
  ['R. Chakraborty', 'rc.adm@gov.in', 'ADM Office', 'OFFICE_ADMIN', 'Inactive'],
]

// Check if directOfficeCode is ancestor of queryOfficeCode in the tree
export function isAncestorOrSelf(ancestorCode: string, descendantCode: string, nodes: OfficeNode[] = offices): boolean {
  if (ancestorCode === descendantCode) return true

  const findNode = (code: string, list: OfficeNode[]): OfficeNode | null => {
    for (const node of list) {
      if (node.code === code) return node
      if (node.children) {
        const found = findNode(code, node.children)
        if (found) return found
      }
    }
    return null
  }

  const ancestorNode = findNode(ancestorCode, nodes)
  if (!ancestorNode || !ancestorNode.children) return false

  const checkDescendant = (code: string, list: OfficeNode[]): boolean => {
    for (const node of list) {
      if (node.code === code) return true
      if (node.children && checkDescendant(code, node.children)) return true
    }
    return false
  }

  return checkDescendant(descendantCode, ancestorNode.children)
}
