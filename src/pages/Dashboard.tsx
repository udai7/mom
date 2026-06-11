import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GitBranch,
  Plus,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
} from 'lucide-react'
import { actions, meetings, offices } from '../mockData'
import {
  Panel,
  Badge,
  MeetingRow,
  ActionButton,
  DataTable,
  StatCard,
  MiniMetric,
} from '../components/Common'
import { OfficeTree, OfficeActivityTable } from '../components/OfficeTreeComponents'
import type { DashboardLevel, WorkspaceView, Icon } from '../types'

export function Dashboard({
  level,
  setActiveView,
}: {
  level: DashboardLevel
  setActiveView: (view: WorkspaceView) => void
}) {
  if (level === 'Super Admin') {
    return <SuperAdminDashboard setActiveView={setActiveView} />
  }

  if (level === 'Parent Office') {
    return <ParentOfficeDashboard setActiveView={setActiveView} />
  }

  if (level === 'Office Member') {
    return <MemberDashboard setActiveView={setActiveView} />
  }

  return <OfficeAdminDashboard setActiveView={setActiveView} />
}

function Stats({ items }: { items: [string, string, Icon][] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value, icon], index) => (
        <StatCard icon={icon} key={label} label={label} tone={index} value={value} />
      ))}
    </section>
  )
}

function OfficeAdminDashboard({ setActiveView }: { setActiveView: (view: WorkspaceView) => void }) {
  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Meetings this month', '22', CalendarDays],
          ['Pending summaries', '4', FileText],
          ['Open action items', '13', ClipboardList],
          ['Upcoming guests', '64', Users],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel action={<Badge tone="peach">Own office</Badge>} title="Office Operations">
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <MeetingRow key={meeting.title} meeting={meeting} />
            ))}
          </div>
        </Panel>
        <Panel title="Admin Tasks">
          <ActionButton icon={Plus} label="Create meeting" onClick={() => setActiveView('Create Meeting')} />
          <ActionButton icon={Upload} label="Submit completed meeting summary" onClick={() => setActiveView('Submit Summary')} />
          <ActionButton icon={Users} label="Manage guest attendance" onClick={() => setActiveView('Meeting Detail')} />
        </Panel>
      </section>
    </div>
  )
}

function ParentOfficeDashboard({ setActiveView }: { setActiveView: (view: WorkspaceView) => void }) {
  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Descendant offices', '12', Building2],
          ['Visible summaries', '31', FileText],
          ['Pending below', '7', ClipboardList],
          ['PDF records', '18', Download],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Hierarchy Overview">
          <OfficeTree nodes={offices} />
        </Panel>
        <Panel action={<Badge tone="amber">Read only</Badge>} title="Child Office Reports">
          <OfficeActivityTable />
          <div className="mt-4">
            <ActionButton icon={FileText} label="Open latest child meeting" onClick={() => setActiveView('Meeting Detail')} />
          </div>
        </Panel>
      </section>
    </div>
  )
}

function SuperAdminDashboard({ setActiveView }: { setActiveView: (view: WorkspaceView) => void }) {
  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Active offices', '18', Building2],
          ['Active users', '142', Users],
          ['Hierarchy depth', '5', GitBranch],
          ['Audit events today', '86', ShieldCheck],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="System Administration">
          <ActionButton icon={Building2} label="Manage office tree" onClick={() => setActiveView('Offices')} />
          <ActionButton icon={UserCog} label="Manage users and roles" onClick={() => setActiveView('Users')} />
          <ActionButton icon={GitBranch} label="Review hierarchy closure" onClick={() => setActiveView('Hierarchy')} />
        </Panel>
        <Panel title="Office Health">
          <OfficeActivityTable />
        </Panel>
        <Panel title="Security Snapshot">
          <MiniMetric label="JWT policy" value="24h access / 7d refresh" />
          <MiniMetric label="PDF storage" value="PostgreSQL bytea" />
          <MiniMetric label="Audit mode" value="Append-only writes" />
        </Panel>
      </section>
    </div>
  )
}

function MemberDashboard({ setActiveView }: { setActiveView: (view: WorkspaceView) => void }) {
  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Invited meetings', '6', CalendarDays],
          ['Confirmed', '4', CheckCircle2],
          ['Assigned actions', '3', ClipboardList],
          ['Available summaries', '9', FileText],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel action={<Badge tone="lavender">Participant</Badge>} title="My Meetings">
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <MeetingRow key={meeting.title} meeting={meeting} />
            ))}
          </div>
        </Panel>
        <Panel title="My Actions">
          <DataTable headers={['Task', 'Assignee', 'Due date', 'Status']} rows={actions} />
          <div className="mt-4">
            <ActionButton icon={FileText} label="View meeting record" onClick={() => setActiveView('Meeting Detail')} />
          </div>
        </Panel>
      </section>
    </div>
  )
}
