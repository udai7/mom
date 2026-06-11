import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  ListFilter,
  MapPin,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import {
  actions,
  guests,
  meetings,
  offices,
  users,
  type MeetingStatus,
  type OfficeNode,
  type Role,
  type View,
} from './mockData'

type Icon = ComponentType<{ className?: string }>

const navItems: { view: View; icon: Icon }[] = [
  { view: 'Dashboard', icon: LayoutDashboard },
  { view: 'Meetings', icon: ClipboardList },
  { view: 'Create Meeting', icon: Plus },
  { view: 'Meeting Detail', icon: FileText },
  { view: 'Submit Summary', icon: Upload },
  { view: 'Office Management', icon: Building2 },
  { view: 'User Management', icon: Users },
]

function App() {
  const [activeView, setActiveView] = useState<View>('Dashboard')
  const [role, setRole] = useState<Role>('Office Admin')
  const [meetingFilter, setMeetingFilter] = useState('All')

  const visibleNav = useMemo(() => {
    if (role === 'Office Member') {
      return navItems.filter(({ view }) =>
        ['Dashboard', 'Meetings', 'Meeting Detail'].includes(view),
      )
    }
    if (role === 'Office Admin') {
      return navItems.filter(({ view }) => view !== 'User Management')
    }
    return navItems
  }, [role])

  const filteredMeetings =
    meetingFilter === 'All'
      ? meetings
      : meetings.filter((meeting) => meeting.status === meetingFilter)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 text-white">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-400 text-slate-950">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">District MoM</p>
                  <h1 className="text-lg font-semibold">Tripura Office</h1>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {visibleNav.map(({ view, icon: NavIcon }) => (
                <button
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                    activeView === view
                      ? 'bg-white text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  key={view}
                  onClick={() => setActiveView(view)}
                  type="button"
                >
                  <NavIcon className="h-4 w-4" />
                  {view}
                </button>
              ))}
            </nav>

            <div className="border-t border-white/10 p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mock role
              </label>
              <select
                className="mt-2 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                onChange={(event) => setRole(event.target.value as Role)}
                value={role}
              >
                <option>Office Admin</option>
                <option>Super Admin</option>
                <option>Office Member</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Phase 1 static frontend
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {activeView}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    className="h-10 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 focus:bg-white"
                    placeholder="Search meetings, offices, users"
                  />
                </div>
                <IconButton label="Notifications">
                  <Bell className="h-4 w-4" />
                </IconButton>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => setActiveView('Create Meeting')}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  New Meeting
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-5">
            {activeView === 'Dashboard' && <Dashboard role={role} />}
            {activeView === 'Meetings' && (
              <MeetingList
                filteredMeetings={filteredMeetings}
                meetingFilter={meetingFilter}
                setActiveView={setActiveView}
                setMeetingFilter={setMeetingFilter}
              />
            )}
            {activeView === 'Create Meeting' && <MeetingForm />}
            {activeView === 'Meeting Detail' && <MeetingDetail />}
            {activeView === 'Submit Summary' && <SummarySubmission />}
            {activeView === 'Office Management' && <OfficeManagement />}
            {activeView === 'User Management' && <UserManagement />}
          </div>
        </main>
      </div>
    </div>
  )
}

function Dashboard({ role }: { role: Role }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Meetings this month" value="34" />
        <StatCard icon={CheckCircle2} label="Completed meetings" value="19" />
        <StatCard icon={FileText} label="Pending summaries" tone="amber" value="7" />
        <StatCard icon={ClipboardList} label="Open action items" tone="cyan" value="21" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel action={<Badge tone="cyan">Next 7 days</Badge>} title="My Office Dashboard">
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <MeetingRow key={meeting.title} meeting={meeting} />
            ))}
          </div>
        </Panel>

        <Panel action={<Badge tone="amber">3 overdue</Badge>} title="Pending Summary Queue">
          <div className="space-y-3">
            {meetings
              .filter((meeting) => meeting.summary !== 'Submitted v2')
              .map((meeting) => (
                <div className="rounded-md border border-slate-200 bg-white p-3" key={meeting.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {meeting.office} - {meeting.summary}
                      </p>
                    </div>
                    <button className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" type="button">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </section>

      {role !== 'Office Member' && (
        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Hierarchy Activity">
            <OfficeTree nodes={offices} />
          </Panel>
          <Panel title="Descendant Office Meetings">
            <OfficeActivityTable />
          </Panel>
        </section>
      )}
    </div>
  )
}

function MeetingList({
  filteredMeetings,
  meetingFilter,
  setActiveView,
  setMeetingFilter,
}: {
  filteredMeetings: typeof meetings
  meetingFilter: string
  setActiveView: (view: View) => void
  setMeetingFilter: (filter: string) => void
}) {
  return (
    <Panel title="Meeting List">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((filter) => (
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                meetingFilter === filter
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              key={filter}
              onClick={() => setMeetingFilter(filter)}
              type="button"
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50" type="button">
          <ListFilter className="h-4 w-4" />
          Date range
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {filteredMeetings.map((meeting) => (
          <button
            className="rounded-md border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-400 hover:shadow-sm"
            key={meeting.title}
            onClick={() => setActiveView('Meeting Detail')}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{meeting.title}</p>
                <p className="mt-1 text-sm text-slate-500">{meeting.office}</p>
              </div>
              <StatusBadge status={meeting.status} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <Info icon={CalendarDays}>{meeting.date}</Info>
              <Info icon={MapPin}>{meeting.location}</Info>
              <Info icon={Users}>{meeting.guests} guests</Info>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  )
}

function MeetingForm() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Create / Edit Meeting">
        <div className="grid gap-4">
          <Field label="Title" placeholder="District e-Governance Review" />
          <label className="grid gap-2 text-sm font-medium">
            Agenda
            <textarea className="min-h-36 rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:border-cyan-500" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Scheduled date and time" type="datetime-local" />
            <Field label="Location" placeholder="DM Conference Hall" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" type="button">
              Save Draft
            </button>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button">
              Schedule Meeting
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Guests">
        <div className="space-y-4">
          <Field label="Internal guest search" placeholder="Search users from any office" />
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <Field label="External guest name" placeholder="Name" />
            <Field label="Designation" placeholder="Designation" />
            <Field label="Contact email" placeholder="optional@email.gov.in" />
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700" type="button">
            <Plus className="h-4 w-4" />
            Add Guest
          </button>
        </div>
      </Panel>
    </div>
  )
}

function MeetingDetail() {
  const meeting = meetings[1]

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={meeting.status} />
              <Badge>{meeting.office}</Badge>
              <Badge tone="cyan">Visible to ancestors</Badge>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">{meeting.title}</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <Info icon={CalendarDays}>{meeting.date}</Info>
              <Info icon={MapPin}>{meeting.location}</Info>
              <Info icon={Users}>{meeting.guests} guests</Info>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50" type="button">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button">
              Schedule Follow-up
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Overview / Summary">
          <p className="leading-7 text-slate-700">
            Review of district-level e-Governance initiatives, pending
            connectivity actions, PDF record submission, and follow-up ownership
            across NIC, DIT, ADM, and block offices.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MiniMetric label="Summary version" value="v2 latest" />
            <MiniMetric label="PDF" value="signed-minutes.pdf" />
          </div>
        </Panel>
        <Panel title="Follow-up Thread">
          {['Original review', 'NIC Infrastructure Upgrade', 'Block Office Connectivity Follow-up'].map((item, index) => (
            <div className="flex gap-3 pb-4 last:pb-0" key={item}>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-800">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-sm text-slate-500">Thread node #{index + 1}</p>
              </div>
            </div>
          ))}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Guest List">
          <DataTable headers={['Name', 'Designation', 'Office', 'Attendance']} rows={guests} />
        </Panel>
        <Panel title="Action Items">
          <DataTable headers={['Task', 'Assignee', 'Due date', 'Status']} rows={actions} />
        </Panel>
      </section>
    </div>
  )
}

function SummarySubmission() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Submit Meeting Summary">
        <div className="space-y-4">
          {['Agenda Recap', 'Discussion Points', 'Conclusions', 'Achievements / Outcomes'].map((label) => (
            <label className="grid gap-2 text-sm font-medium" key={label}>
              {label}
              <textarea className="min-h-24 rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:border-cyan-500" />
            </label>
          ))}
          <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button">
            Submit Summary
          </button>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Action Items">
          <div className="space-y-3">
            <Field label="Task" placeholder="Prepare connectivity report" />
            <Field label="Assignee" placeholder="DIT Tripura" />
            <Field label="Due date" type="date" />
          </div>
        </Panel>
        <Panel title="PDF Upload">
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <Paperclip className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 font-medium">Drop signed minutes PDF</p>
            <p className="mt-1 text-sm text-slate-500">Maximum size 20 MB</p>
            <button className="mt-4 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700" type="button">
              Choose PDF
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function OfficeManagement() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel title="Office Tree Management">
        <OfficeTree nodes={offices} />
      </Panel>
      <Panel title="Add / Edit Office">
        <div className="space-y-4">
          <Field label="Office name" placeholder="e-Governance Cell" />
          <Field label="Office code" placeholder="EGOV-01" />
          <Field label="Parent office" placeholder="DIT Tripura" />
          <Field label="Contact email" placeholder="office@gov.in" />
          <button className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button">
            Save Office
          </button>
        </div>
      </Panel>
    </div>
  )
}

function UserManagement() {
  return (
    <Panel
      action={
        <button className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button">
          <Plus className="h-4 w-4" />
          Create User
        </button>
      }
      title="User Management"
    >
      <DataTable headers={['Name', 'Email', 'Office', 'Role', 'Status']} rows={users} />
    </Panel>
  )
}

function OfficeTree({ nodes, depth = 0 }: { nodes: OfficeNode[]; depth?: number }) {
  return (
    <div className="space-y-2">
      {nodes.map((office) => (
        <div key={office.code}>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3" style={{ marginLeft: depth * 18 }}>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-cyan-600" />
              <div>
                <p className="font-medium">{office.name}</p>
                <p className="text-xs text-slate-500">{office.code} - {office.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge>{office.meetings} meetings</Badge>
              <Badge tone={office.pending ? 'amber' : 'green'}>{office.pending} pending</Badge>
            </div>
          </div>
          {office.children && <OfficeTree depth={depth + 1} nodes={office.children} />}
        </div>
      ))}
    </div>
  )
}

function OfficeActivityTable() {
  const rows = offices[0].children?.map((office) => [
    office.name,
    office.lastMeeting,
    String(office.meetings),
    String(office.pending),
  ]) ?? []

  return <DataTable headers={['Office', 'Last meeting', 'Meetings this month', 'Pending']} rows={rows} />
}

function Panel({ action, children, title }: { action?: ReactNode; children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatCard({ icon: StatIcon, label, tone = 'slate', value }: { icon: Icon; label: string; tone?: 'slate' | 'amber' | 'cyan'; value: string }) {
  const color =
    tone === 'amber'
      ? 'bg-amber-100 text-amber-800'
      : tone === 'cyan'
        ? 'bg-cyan-100 text-cyan-800'
        : 'bg-slate-100 text-slate-800'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-4 grid h-10 w-10 place-items-center rounded-md ${color}`}>
        <StatIcon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function MeetingRow({ meeting }: { meeting: (typeof meetings)[number] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-medium">{meeting.title}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
            <Info icon={CalendarDays}>{meeting.date}</Info>
            <Info icon={MapPin}>{meeting.location}</Info>
          </div>
        </div>
        <StatusBadge status={meeting.status} />
      </div>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            {headers.map((header) => <th className="px-3 py-3 font-semibold" key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.join('-')}>
              {row.map((cell, index) => (
                <td className="px-3 py-3" key={`${cell}-${index}`}>
                  {index === row.length - 1 ? <Badge>{cell}</Badge> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500" placeholder={placeholder} type={type} />
    </label>
  )
}

function Info({ children, icon: InfoIcon }: { children: ReactNode; icon: Icon }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <InfoIcon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="truncate">{children}</span>
    </span>
  )
}

function IconButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button aria-label={label} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title={label} type="button">
      {children}
    </button>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const tone =
    status === 'COMPLETED'
      ? 'green'
      : status === 'SCHEDULED'
        ? 'cyan'
        : status === 'IN_PROGRESS'
          ? 'amber'
          : status === 'CANCELLED'
            ? 'red'
            : 'slate'

  return <Badge tone={tone}>{status.replace('_', ' ')}</Badge>
}

function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'cyan' | 'green' | 'red' }) {
  const colors = {
    amber: 'bg-amber-100 text-amber-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-rose-100 text-rose-800',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}>
      {children}
    </span>
  )
}

export default App
