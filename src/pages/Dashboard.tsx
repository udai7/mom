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
import { actions, offices, isAncestorOrSelf } from '../mockData'
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
import { getStoredMeetings, profiles, type DashboardLevel, type WorkspaceView, type Icon } from '../types'

export function Dashboard({
  level,
  setActiveView,
}: {
  level: DashboardLevel
  setActiveView: (view: WorkspaceView) => void
}) {
  const profile = profiles.find((p) => p.level === level)!
  const userOfficeCode = profile.officeCode

  // Dynamically load stored meetings
  const allMeetings = getStoredMeetings()

  // Filter meetings based on ancestral permissions:
  // Direct ancestors can see child office data, otherwise restricted. Super Admin sees all.
  const visibleMeetings =
    level === 'Super Admin'
      ? allMeetings
      : allMeetings.filter((meeting) => isAncestorOrSelf(userOfficeCode, meeting.officeCode))

  const handleMeetingClick = (meetingId: string) => {
    localStorage.setItem('mom_active_meeting_id', meetingId)
    setActiveView('Meeting Detail')
  }

  if (level === 'Super Admin') {
    return (
      <SuperAdminDashboard
        visibleMeetings={visibleMeetings}
        setActiveView={setActiveView}
        onMeetingClick={handleMeetingClick}
      />
    )
  }

  if (level === 'Parent Office') {
    return (
      <ParentOfficeDashboard
        visibleMeetings={visibleMeetings}
        setActiveView={setActiveView}
        onMeetingClick={handleMeetingClick}
      />
    )
  }

  return (
    <OfficeAdminDashboard
      visibleMeetings={visibleMeetings}
      setActiveView={setActiveView}
      onMeetingClick={handleMeetingClick}
    />
  )
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

function OfficeAdminDashboard({
  visibleMeetings,
  setActiveView,
  onMeetingClick,
}: {
  visibleMeetings: any[]
  setActiveView: (view: WorkspaceView) => void
  onMeetingClick: (id: string) => void
}) {
  const totalMeetings = visibleMeetings.length
  const pendingMeetings = visibleMeetings.filter((m) => m.status !== 'COMPLETED').length
  const actionItemsCount = visibleMeetings.reduce((acc, m) => acc + (m.actionItems || 0), 0)
  const totalGuests = visibleMeetings.reduce((acc, m) => acc + (m.guests || 0), 0)

  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Meetings registered', String(totalMeetings), CalendarDays],
          ['Pending summaries', String(pendingMeetings), FileText],
          ['Open action items', String(actionItemsCount), ClipboardList],
          ['Total guests', String(totalGuests), Users],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel action={<Badge tone="peach">My Office Dashboard</Badge>} title="Office Operations">
          <div className="space-y-3">
            {visibleMeetings.length > 0 ? (
              visibleMeetings.slice(0, 3).map((meeting) => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  onClick={() => onMeetingClick(meeting.id)}
                />
              ))
            ) : (
              <p className="text-sm text-[#6a6a6a]">No meetings recorded for this office.</p>
            )}
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

function ParentOfficeDashboard({
  visibleMeetings,
  setActiveView,
  onMeetingClick,
}: {
  visibleMeetings: any[]
  setActiveView: (view: WorkspaceView) => void
  onMeetingClick: (id: string) => void
}) {
  const descendantOfficesCount = 12
  const visibleSummaries = visibleMeetings.filter((m) => m.summary !== 'Pending').length
  const pendingBelow = visibleMeetings.filter((m) => m.status !== 'COMPLETED').length
  const pdfRecords = visibleMeetings.filter((m) => m.status === 'COMPLETED').length

  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Descendant offices', String(descendantOfficesCount), Building2],
          ['Visible summaries', String(visibleSummaries), FileText],
          ['Pending below', String(pendingBelow), ClipboardList],
          ['PDF records', String(pdfRecords), Download],
        ]}
      />
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Hierarchy Overview">
          <OfficeTree nodes={offices} />
        </Panel>
        <Panel action={<Badge tone="amber">Read only</Badge>} title="Child Office Reports">
          <OfficeActivityTable />
          <div className="mt-4 space-y-3">
            {visibleMeetings.length > 0 && (
              <ActionButton
                icon={FileText}
                label={`Open latest child meeting: ${visibleMeetings[0].title}`}
                onClick={() => onMeetingClick(visibleMeetings[0].id)}
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  )
}

function SuperAdminDashboard({
  visibleMeetings,
  setActiveView,
  onMeetingClick,
}: {
  visibleMeetings: any[]
  setActiveView: (view: WorkspaceView) => void
  onMeetingClick: (id: string) => void
}) {
  const activeOfficesCount = 18
  const activeUsersCount = 142
  const hierarchyDepth = 5
  const totalAuditEvents = visibleMeetings.length * 2 + 5

  return (
    <div className="space-y-5">
      <Stats
        items={[
          ['Active offices', String(activeOfficesCount), Building2],
          ['Active users', String(activeUsersCount), Users],
          ['Hierarchy depth', String(hierarchyDepth), GitBranch],
          ['Audit events today', String(totalAuditEvents), ShieldCheck],
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
