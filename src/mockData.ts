export type Role = 'Office Admin' | 'Super Admin' | 'Office Member'

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
      },
    ],
  },
]

export const meetings = [
  {
    title: 'District e-Governance Review',
    office: 'DM Office',
    status: 'SCHEDULED' as MeetingStatus,
    date: '12 Jun 2026, 11:00 AM',
    location: 'DM Conference Hall',
    guests: 18,
    summary: 'Pending',
    actionItems: 6,
  },
  {
    title: 'NIC Infrastructure Upgrade',
    office: 'NIC Tripura',
    status: 'COMPLETED' as MeetingStatus,
    date: '10 Jun 2026, 03:30 PM',
    location: 'NIC Meeting Room',
    guests: 9,
    summary: 'Submitted v2',
    actionItems: 4,
  },
  {
    title: 'Block Office Connectivity Follow-up',
    office: 'DIT Tripura',
    status: 'IN_PROGRESS' as MeetingStatus,
    date: '11 Jun 2026, 02:00 PM',
    location: 'Virtual',
    guests: 23,
    summary: 'Not due',
    actionItems: 8,
  },
  {
    title: 'SCERT Curriculum Digitization',
    office: 'SCERT',
    status: 'COMPLETED' as MeetingStatus,
    date: '06 Jun 2026, 12:00 PM',
    location: 'SCERT Board Room',
    guests: 12,
    summary: 'PDF only',
    actionItems: 3,
  },
]

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
  ['Ananya Saha', 'ananya.dit@gov.in', 'DIT Tripura', 'OFFICE_MEMBER', 'Active'],
  ['R. Chakraborty', 'rc.adm@gov.in', 'ADM Office', 'OFFICE_ADMIN', 'Inactive'],
]
